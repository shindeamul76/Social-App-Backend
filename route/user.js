const express = require('express');
const router = express.Router();

const { Register, Login, followeUser, logOut, updatePassword, updateProfile } = require('../Controllers/user');
const { isAuthenticated } = require('../middlewares/auth');

router.route('/register').post(Register)

router.route('/login').post(Login);

router.route('/logout').get(logOut);

router.route('/follow/:id').get(isAuthenticated, followeUser);

router.route('/update/password').put(isAuthenticated, updatePassword);

router.route('/update/profile').put(isAuthenticated, updateProfile);



module.exports = router