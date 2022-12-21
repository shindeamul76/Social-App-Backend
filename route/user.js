const express = require('express');
const router = express.Router();

const { 
    Register, 
    Login, 
    followeUser,
    logOut, 
    updatePassword, 
    updateProfile, 
    deleteProfile, 
    myProfile,
    getUserProfile,
    getAllUsers,
    forgetPassword,
    resetPassword
    } = require('../Controllers/user');

const { isAuthenticated } = require('../middlewares/auth');

router.route('/register').post(Register)

router.route('/login').post(Login);

router.route('/logout').get(logOut);

router.route('/follow/:id').get(isAuthenticated, followeUser);

router.route('/update/password').put(isAuthenticated, updatePassword);

router.route('/update/profile').put(isAuthenticated, updateProfile);

router.route('/delete/me').delete(isAuthenticated, deleteProfile);

router.route('/me').get(isAuthenticated, myProfile);

router.route('/user/:id').get(isAuthenticated, getUserProfile);

router.route('/users').get(isAuthenticated, getAllUsers);

router.route('/forgot/password').post(forgetPassword);

router.route('/password/reset/:token').put(resetPassword);


module.exports = router