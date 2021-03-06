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

router.get('/reportedPosts', postControllers.getReportedPosts);

router.post(
  '/createPost',
  [
    check('title').trim().isLength({ max: 100 }),
    check('content').trim().isLength({ min: 3, max: 2000 }),
  ],
  postControllers.createPost
);

router.post('/likeAction', postControllers.likeAction);

router.post(
  '/comment',
  [check('content').isLength({ min: 1, max: 500 })],
  postControllers.commentPost
);

router.delete('/comment/:postId/:commentId', postControllers.deleteComment);

router.patch('/editPost/:postId', postControllers.editPost);

router.post('/post/report', postControllers.reportPost);

router.delete('/deletePost/:postId', postControllers.deletePost);

module.exports = router;
