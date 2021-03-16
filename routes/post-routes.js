const express = require('express');
// const { check } = require('express-validator');

const checkAuth = require('../middleware/check-auth');
const postControllers = require('../controllers/post-controllers');

const router = express.Router();

router.get('/getAllPosts', postControllers.getAllPosts);

router.get('/getUserPosts/:username', postControllers.getUserPosts);

router.use(checkAuth);

router.post('/createPost', postControllers.createPost);

router.delete('/deletePost/:postId', postControllers.deletePost);

module.exports = router;
