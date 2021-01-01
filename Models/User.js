const crypto =require("crypto")
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['user', 'publisher'],//enum means i want it to be only one of two values
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false//wwhen we select a user through our api it wont show the password
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

 // Encrypt password using bcrypt
 UserSchema.pre('save', async function(next) {

  //before saving anyuser this middleware is running
  //well offcourse yourwell awrare of that but it will cause tropule
  //we dont wnate it to run when we use forgot password route
  //becuse we are not writing the pasword
  if(!this.isModified('password')){
    next();
  }
  //this will only run if the password is modified
   const salt = await bcrypt.genSalt(10);//note the higher the rounds the more it is secure thought 
   //it will be more heavier on you computer
   this.password = await bcrypt.hash(this.password, salt);//when we submit we have acess to the fileds 
   //offcourse password is plane text because its pre
 });

 // Sign JWT and return (so now we gonna use JWT to generate a token whenever a user is created)
 UserSchema.methods.getSignedJwtToken = function() {//.methods now hopfully you know the diff between static and method
  //well if you dont .static is used on the model it self while . method is used on what you initialitiaed from the model
  //why use tokens? whenever a user sends a request with the token we know witch user that is
  //so we can lookout the token and oullout the user 
  //another question you have in mind 
  //is we can use the user id insted ...
  //thats right but its slower
   return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
     expiresIn: process.env.JWT_EXPIRE
   });
 };
 //match user password with the encrypted one in database

  UserSchema.methods.matchPasswors=async function(enteredPassword){
  return await bcrypt.compare(enteredPassword, this.password);//we have access to the users fileds
 };
 //generate and hash password token
 UserSchema.methods.getResetPasswordToken=async function(){
  //generate token
  const resetToken =crypto.randomBytes(20).toString('hex');
  //hash token and set to ResetPasswordToken filed
  this.resetPasswordToken =crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex');//now we have access to the filed and we are setting it to the hashed version
  //set expire
  this.resetPasswordExpire=Date.now() + 10*60 * 1000;

   return resetToken;//the original one not the hashed one
 };




module.exports = mongoose.model('User', UserSchema);
