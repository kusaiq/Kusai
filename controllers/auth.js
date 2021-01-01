const crypto = require('crypto');
const asyncHandler = require('../middleware/async');//no more try catch
const sendEmail= require("../utils/sendEmail")
const User = require('../models/User');
const errorResponse = require ('../utils/errorResponse');//I say what the error is

//dsc
//register a user
// route post /api/v1/auth/register
// access public
exports.register = asyncHandler(async (req, res, next) => {
        const{name,email,password,role}=req.body;//we are pulling some things out of the req.body
  		//create our User
  		const user=await User.create({
  			name,
  			email,
  			password,//notice we didnt hash the password and the reason for that is 
  			//we are gonna create a middleware so when ever a user is created 
  			//this middleware will run and hash it
  			role
  		});
  		//create token 
  		//const token =user.getSignedJwtToken();//its imortant that is a lower case because it not a static method
  		//res.status(200).json({success:true,token})
  		//i commented the above code cuz we gonna use cookies
  		
  		sendTokenResponse(user, 200, res);
    });

    //dsc
//login a user
// route post /api/v1/auth/login
// access public
exports.login = asyncHandler(async (req, res, next) => {
        const{email,password}=req.body;//we are pulling some things out of the req.body
  		//first lets check if the password and the email written
  		if(!password || !email){
  			return next(new errorResponse(`please add a password ${req.params.id}`,404));
  			//the reason why we done some auth in here and not in the register
  			//cuz in the register error handling is hapening the model it self 
  			//and here we are checking so we gonna have to write the error handling our selfs 
  		}
  		//now we gonna check if the user is in the base (in the next line of code we are finding)
  		const user = await User.findOne({email}).select('+password');//the meaning behind the .select
  		//is in our model we write that the password select is false so we cant access it 
  		if(!user){
  			return next(new errorResponse(`ivalid crotential ${req.params.id}`,401));//401 means its unautherized
  		}
  		//FOR THE PASSWORD WE GONNA HAVE TO TAKE THE PLANE TEXT PASSWORD AND compare it
  		//to the encrypted password
  		//so we gonna need a fuction to decrypt the password and compare it 
  		const ismatched = await user.matchPasswors(password);//the reason we are using await is becuz we are using 
  		//bcrypt witch is in fact is a promise
  		if(!ismatched){
  			return next(new errorResponse(`ivalid crotential ${req.params.id}`,401));
  		}

  		//const token =user.getSignedJwtToken();//its imortant that is a lower case because it not a static method
  		//res.status(200).json({success:true,token})
  		sendTokenResponse(user, 200, res);
    });

//dsc
//user info
// route get /api/v1/auth/register
// access private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);//since we are using the protect middleware we always 
  //have acess to req.user witch will always be the logged in user
  res
  .status(200)
  .json({
    success:true,
    data:user
  });
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {//set token to none and we gonna set it to expire in like 10 sec
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

  //dsc
//forgot password 
// route post /api/v1/auth/forgotpassword
// access private
exports.forgotPassword = asyncHandler(async (req, res, next) => {
//first we gonna find the user by the entered email
const user = await User.findOne({email:req.body.email});
//lets check if the user exists
if(!user){
  return next(new errorResponse(`no user was found with the email ${req.body.email} `,404));
}
//if the user exists then lets generate out reste token filed then hash it 
//remeber the hashed version will be saved
const resetToken = await user.getResetPasswordToken();//we gonna write a method in the modle that dose what i wrote in the above line
console.log(resetToken);
await user.save({validateBeforeSave:false});

//pepare somthings for our send email util
//creaate reset url

const resetUrl =`${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;//route thay sends to our reset token

const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
//in the function we wrote in the send email util these are the options
try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new errorResponse('Email could not be sent', 500));
  }

//now we are gonna create a message to pass in
  res
  .status(200)
  .json({
    success:true,
    data:user
  });
});

  //dsc
//rsest password 
// route post /api/v1/auth/resetPassword/:resetToken
// access public
exports.resetPassword = asyncHandler(async (req, res, next) => {
//now in the forgot password we created a reset token and an expire token
//first lets get the unhashed token and hash it using crypto
const resetPasswordToken = crypto
  .createHash('sha256')
  .update(req.params.resetToken)
  .digest('hex');

 const user = await User.findOne({
  resetPasswordToken,
  resetPasswordExpire: { $gt : Date.now() }
 });
 if(!user){
  return next(new errorResponse(`Invalid crotential `,400));
}
//set a new password
user.password=req.body.password;//the password will be encrypted cuz of our middleware
//in the model we wrote when ever a user is saved make sure to encrypt the password only when the user 
//only if the users password is modified 
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendTokenResponse(user, 200, res);

});

//dsc
//update user info)(email and username)
// route put /api/v1/auth/updateDetails
// access private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  filedsToUpdate={
    name :req.body.name,
    email :req.body.email
  }
  let user =await User.findByIdAndUpdate(req.user.id,filedsToUpdate,{
    new :true,
    runValidators :true
  });
   

  res
  .status(200)
  .json({
    success:true,
    data:user
  });
});

//dsc
//update user info)(email and username)
// route put /api/v1/auth/updatePassword
// access private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  //check if the old password is right 
  if(!(await user.matchPasswors(req.body.password))){
    return next(new errorResponse(`Invalid crotential `,400));
  }
  user.password=req.b

  res
  .status(200)
  .json({
    success:true,
    data:user
  });
});





  // Get token from model, create cookie and send response
    const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
      expires: new Date(
       Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000//when dose the cookie expire now this code 
        //was wriiten this way cuz we cant write it in days like jwt
      //its actually in sec so we had to do that
      ),
      httpOnly: true
    };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;//it will be https you know we can ignore that
  }

  res
    .status(statusCode)
    .cookie('token', token, options)//.cookie takes a key value witch is token
    //takes a value witch is token and the options
    .json({
      success: true,
      token
    });
  };