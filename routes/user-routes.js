const express = require('express');
const { check } = require('express-validator');

const userControllers = require('../controllers/user-controllers');

const router = express.Router();

router.post('/login', userControllers.login);

router.post(
  '/signup',
  [
    check('username').isLength({ min: 3 }),
    check('password').isLength({ min: 6 }),
    check('repeatPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  ],
  userControllers.signup
);

module.exports = router;
