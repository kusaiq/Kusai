const jwt =require('jsonwebtoken');
const asyncHandler =require('./async');
const errorResponse=require('../utils/errorResponse');
const User=require('../models/User');

//protect routes
exports.protect = asyncHandler(async (req, res, next) => {
	let token;
	//now we wanna check the headers
	//we gonna check the authorization header
	if(req.headers.authorization && 
	   req.headers.authorization.startsWith('Bearer')
	   ) {
	   	token	=req.headers.authorization.split(' ')[1];
	   	//now we only want the token part
	}
	//uncomment that if you wanna use cookies
	//else if(req.cookies.token){
		//token =req.cookies.token
	//}
	//check if token exists
	if(!token){
		 return next(new errorResponse(`not authorize to access this route `,401));
	}
	//but if the token dose exist we gonna have to verify it
	try{
		//verify token 
		//now we gonna extract the payload
		const decoded  = jwt.verify(token,process.env.JWT_SECRET)
		console.log(decoded)
		//the decoded had the id value
		req.user =await User.findById(decoded.id);//so what ever id is in that token
		//witch the user got from loggin in
		//so this will always be the logged in user 
		next();
	}catch(err){
return next(new errorResponse(`not authorize to access this route `,401));
	}

});
// Grant access to specific roles
exports.authorize = (...roles) => {//so this function we used destructuring to the the role varliable
  //so this is a value that we will pass in 
  //witch is either publicher or admin 
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {//.includes if you have an array 
      //and you wanna check if it includes the thing you need or not 
      //it returns true or false
      return next(
        new errorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

