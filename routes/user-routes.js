const express = require('express');
const { check } = require('express-validator');

const userControllers = require('../controllers/user-controllers');

const router = express.Router();

router.get('/getUserData/:uid', userControllers.getUserData);

router.post('/login', userControllers.login);

router.post(
  '/signup',
  [
    check('username').trim().isLength({ min: 3 }),
    check('password').trim().isLength({ min: 5 }),
    check('repeatPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  ],
  userControllers.signup
);

router.patch('/updateDesc/:uid', userControllers.updateDescription);

module.exports = router;
