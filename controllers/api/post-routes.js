const router = require('express').Router()
const { Post, User, Vote } = require('../../models')
const Comment = require('../../models/Comment') // Comment doesn't like destructuring
const { sequelize } = require('../../models/User')

// get all posts
router.get('/', (req, res) => {
    console.log('=========')
    Post.findAll({ // finds all posts with the attributes id, post_url, title and created_at. Also includes username to be shown
        attributes: ['id', 'post_url',  'title', 'created_at', [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']],
        order: [['created_at', 'DESC']],
        include: [
            {
              model: Comment,
              attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
              include: {
                model: User,
                attributes: ['username']
              }
            },
            {
              model: User,
              attributes: ['username']
            }
          ]
    })
      .then(dbPostData => res.json(dbPostData))
      .catch(err => {
          console.log(err)
          res.status(500).json(err)
      })
})

// get single post 
router.get('/:id', (req, res) => {
    Post.findOne({
        where: {
            id: req.params.id
        },
        attributes: ['id', 'post_url', 'title', 'created_at', [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']],
        include: [
            {
                model: Comment,
                attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
                include: {
                    model: User,
                    attributes: ['username']
                }
                
            },
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
      .then(dbPostData => {
          if(!dbPostData) {
              res.status(404).json({ message: 'No post found with this id' })
              return
          }
          res.json(dbPostData)
      })
      .catch(err => {
          console.log(err)
          res.status(500).json(err)
      })
})

router.post('/', (req, res) => {
    // expects {title, post_url, user_id}
    Post.create({
        title: req.body.title,
        post_url: req.body.post_url,
        user_id: req.body.user_id
    })
      .then(dbPostData => res.json(dbPostData))
      .catch(err => {
          console.log(err)
          res.status(500).json(err)
      })
})

// PUT /api/posts/upvote | allows user to upvote a post
router.put('/upvote', (req, res) => {
   // custom static method created in models/Post.js

   // making sure the session exists first
   if(req.session) {
        // pass session id along with all destructured properties on req.body 
        Post.upvote({ ...req.body, user_id: req.session.user_id}, { Vote })
        .then(updatedPostData => res.json(updatedPostData))
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        })
   }
})

router.put('/:id', (req, res) => {
    Post.update(
        {
            title: req.body.title
        },
        {
            where: {
                id: req.params.id
            }
        }
    ).then(dbPostData => {
        if(!dbPostData) {
            res.status(404).json({ message: 'No post found with this id' })
            return
        }
        res.json(dbPostData)
    }).catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

router.delete('/:id', (req, res) => {
    Post.destroy({
        where: {
            id: req.params.id
        }
    })
     .then(dbPostData => {
         if(!dbPostData) {
             res.status(404).json({ message: 'No post found with this id' })
             return
         }
         res.json(dbPostData)
     })
      .catch(err => {
          console.log(err)
          res.status(500).json(err)
      })
})

module.exports = router