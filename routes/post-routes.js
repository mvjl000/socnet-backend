const express = require('express');
// const { check } = require('express-validator');

const postControllers = require('../controllers/post-controllers');

const router = express.Router();

router.post('/createPost', postControllers.createPost);

module.exports = router;
