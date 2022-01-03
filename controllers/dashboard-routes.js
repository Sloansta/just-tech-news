const router = require('express').Router()
const sequelize = require('../config/connection')
const { Post, User } = require('../models')
const Comment = require('../models/Comment') // Comment doesn't like to be destructured for some reason :)
const withAuth = require('../utils/auth')

router.get('/', withAuth, (req, res) => {
    Post.findAll({
        where: {
            // getting id from session
            user_id: req.session.user_id
        },
        attributes: [
            'id',
            'post_url',
            'title',
            'created_at',
            [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
        ],
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
        // serialize data before passing it to template
        const posts = dbPostData.map(post => post.get({ plain: true }))
        res.render('dashboard', { posts, loggedIn: true })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

router.get('/edit/:id', withAuth, (req, res) => {
    Post.findOne({
        where: {
            id: req.params.id
        },
        attributes: [
            'id',
            'post_url',
            'title',
            'created_at',
            [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
        ],
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
        const post = dbPostData.get({ plain: true })
        res.render('edit-post', { post, loggedIn: true })
    })
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

router.delete('/post/:id', withAuth, (req, res) => {
    Post.findOne({
        where: {
            id: req.params.id
        }
    })
    .then(dbPostData => {
        if(!dbPostData)
            alert('post not found')
        dbPostData.destroy()
        res.render('dashboard', {loggedIn: true})
    })
    .catch(err => {
        console.log(err)
        res.status(500).json(err)
    })
})

module.exports = router