const express = require('express');
// const { check } = require('express-validator');

const checkAuth = require('../middleware/check-auth');
const postControllers = require('../controllers/post-controllers');

const router = express.Router();

router.use(checkAuth);

router.post('/createPost', postControllers.createPost);

module.exports = router;
