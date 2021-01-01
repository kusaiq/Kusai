const errorResponse = require ('../utils/errorResponse');//I say what the error is
const asyncHandler = require('../middleware/async')//no more try catch
const Course =require( '../models/Course.js');//my Schema
const Bootcamp = require('../models/Bootcamps');

//dsc
//get corses
// route Get /api/v1/courses
// route Get /api/v1/bootcamps/:bootcampId/courses
// access public
exports.getCourses = asyncHandler(async (req, res, next) => {

	

	//now we gonna check if a bootcampid exists
	if(req.params.bootcampId){
		
		//we are not using the middel ware cuz we dont need any pagination if the user specified  
		 const courses=await Course.find({bootcamp: req.params.bootcampId});
         return res.status(200).json({success:true ,count:courses.length ,data : courses})

	}else{
		res.status(200).json(res.advancedResults);//find all courses
		//using populate we show whats inside bootcamp 
    //all of this will be exported to the route file 
	}




    });

//dsc
//get a single corses
// route Get /api/v1/courses/:id
// access public
exports.getCourse = asyncHandler(async (req, res, next) => {

	const course = await Course.findById(req.params.id).populate({
		path:'bootcamp',
		select:'name description'
	});
        if (!Course) {
            return next(new errorResponse(`corse not found with id of ${req.params.id}`,404));
        }

        res.status(200)
            .json({
                success: true,
                data:course
            });
        


        
  
    });

//dsc
//add a new course to a bootcamp
// route post /api/v1/bootcamps/:bootcampId/courses //shit i remeberd that our courses are assciated with a bootcamp so we need to find a way to get the bootcamp id
// access private
exports.addCourse = asyncHandler(async (req, res, next) => {
        //now lets add the user id to the req.body
        req.body.user=req.user.id;//we have acess to that from out middleware
   
         req.body.bootcamp = req.params.bootcampId;//we pulled it out of the url and put it in the body mauley added in the body
         const bootcamp = await Bootcamp.findById(req.params.bootcampId);//make sure that the bootcamp that we are adding course to exist

      if(!bootcamp){
      	return next(
      		new errorResponse(`no bootcamp with id of ${req.params.bootcampId}`,
      			404));
      }
      //make sure currently looged in user is the ownor
        if(bootcamp.user.toString()!== req.user.id && req.user.role !== 'admin'){//the reason is it is bootcamp.user
          //its becuz we have access to it from the line above
             return next(
             new errorResponse(
             `User ${req.user.id} is not authorized to add this course`,401)
             )};

     const course = await Course.create(req.body);//it includes req.body.bootcamp
 

      res.status(200)
            .json({
                success: true,
                data:course
            });
        
           
        });

        //dsc
//update  course
// route put /api/v1/course/:id
// access private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    
        let course = await Course.findByIdAndUpdate(req.params.id);
       
        if (!course) {
            return next(new errorResponse(`course not found with id of ${req.params.id}`,404));
        }
        //make sure currently looged in user is the ownor
        if(course.user.toString()!== req.user.id && req.user.role !== 'admin'){//the reason is it is bootcamp.user
          //its becuz we have access to it from the line above
             return next(
             new errorResponse(
             `User ${req.user.id} is not authorized to update this bootcamp`,401)
             )};

              course = await Course.findByIdAndUpdate(req.params.id, req.body, {
              new: true,
              runValidators: true
              });
        res.status(200)
            .json({
                success: true,
                data: course
            });
    
        
    })

//dsc
//delete course
// route Get /api/v1/course/id
// access private
exports.deleteCourse = asyncHandler(async(req, res, next) => {
    
        const course =  Course.findById(req.params.id 
          
        );//findByIdAndDelete dosent work and the reason why is the remove middle ware wont be triggered
        if (!course) {
            return next(new errorResponse(`course not found with id of ${req.params.id}`,404)
                );
             
        }
         // Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete course ${course._id}`,
        401
      )
    );
  }

       
            await course.remove()
             res.status(200)
            .json({
                success: true,
                data: {}
            });
    
       
    })
 




	