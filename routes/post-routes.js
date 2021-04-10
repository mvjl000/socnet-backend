const express = require('express');
const { check } = require('express-validator');

const checkAuth = require('../middleware/check-auth');
const postControllers = require('../controllers/post-controllers');

const router = express.Router();

router.get('/getAllPosts', postControllers.getAllPosts);

router.get('/comments/:postId', postControllers.getPostComments);

router.get('/post/:postId', postControllers.getPostById);

router.get('/getUserPosts/:uname', postControllers.getUserPosts);

router.use(checkAuth);

router.post(
  '/createPost',
  [
    check('title').trim().isLength({ max: 100 }),
    check('content').trim().isLength({ min: 3, max: 2000 }),
  ],
  postControllers.createPost
);

router.post('/likeAction', postControllers.likeAction);

router.post('/comment', postControllers.commentPost);

router.patch('/editPost/:postId', postControllers.editPost);

router.delete('/deletePost/:postId', postControllers.deletePost);

module.exports = router;
