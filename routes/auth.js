const express = require('express');

const { register,login,getMe,forgotPassword,resetPassword,updateDetails,logout
    
} = require('../controllers/auth');


const { protect}=require('../middleware/auth');


const router = express.Router();
router.post("/register",register);
router.post('/login',login);
router.get('/logout',logout);
router.get('/me',protect,getMe);
router.post('/forgotPassword',forgotPassword);
router.put('/resetPassword/:resetToken',resetPassword);
router.put('/updateDetails',protect,updateDetails);


module.exports = router;