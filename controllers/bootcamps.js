const path  =   require('path')
const errorResponse = require ('../utils/errorResponse');//I say what the error is
const asyncHandler = require('../middleware/async')//no more try catch
const Bootcamp = require('../models/Bootcamps');
const geocoder  =require('../utils/geocoder');//locations...


//dsc
//get all bootcamps
// route Get /api/v1/bootcamps
// access public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
        res.status(200).json(res.advancedResults);//we have access to that because we are exportin this to our routes file
  
    });

//dsc
//get a bootcamp
// route Get /api/v1/bootcamps/:id
// access public
exports.getBootcamp =asyncHandler (async (req, res, next) => {

    
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            return next(new errorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }

        res.status(200)
            .json({
                success: true,
                data:bootcamp
            });

    
        //res.status(400).json({ success: false });
        
    });


//dsc
//create new bootcamp
// route post /api/v1/bootcamps
// access private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
        //all this time when we create a bootcamp we dont implement 
        //checking if the user have already created a bootcamp
        //also you can't edit a bootcamp that you dont owne
        //first thing lets bring the user
        //now lets add the user id to the req.body
        req.body.user=req.user.id;//we have acess to that from out middleware

        //we want a publisher only allowed to make one bootcamp
        //check published bootcamps

        const publishedBootcamp = await Bootcamp.findOne({user :req.user.id});//now in this line of code we are finding the owner of this bootcamp

        //the reason why is when we add a bootcamp we want to add the user id in the req.ody
        //becuz offcourse the user wont write that so here gose
        //before adding lets check if  the user already created a bootcamp
        //if the user is not admin they can only add one
        if(publishedBootcamp && req.user.role !=="admin"){
           return next(new errorResponse(`Bootcamp cant be added with id of ${req.user.id}`,400));
        }
        
         const bootcamp = await Bootcamp.create(req.body);
         console.log(req.body)
        res.status(201).json({
            success: true,
            data: bootcamp
        });

        
           
        });
    


//dsc
//update  bootcamps
// route put /api/v1/bootcamps/:id
// access private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
        //now this at the beggining was const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            //new: true,
           // runValidators: true
        //});
        //now it wont work reason why we are checking if the user is the ownor for the bootcamp ro be updated
        //so we cant let him update until its validated
        let bootcamp =await Bootcamp.findById(req.params.id);//finding the bootcamp and checking if it exsists
        if (!bootcamp) {
            return next(new errorResponse(`Bootcamp not found with id of ${req.params.id}`,404));
        }
        //make sure currently looged in user is the ownor
        if(bootcamp.user.toString()!== req.user.id && req.user.role !== 'admin'){
             return next(
             new errorResponse(
             `User ${req.params.id} is not authorized to update this bootcamp`,401)
             )};
                //now if the bootcamp is the ownor then 
             bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, req.body, {
                new: true,
            runValidators: true
        });
        res.status(200)
            .json({
                success: true,
                data: bootcamp
            });
    
        
    })


//dsc
//delete bootcamps
// route Get /api/v1/bootcamps/id
// access private
exports.deleteBootcamp = asyncHandler(async(req, res, next) => {
    
        const bootcamp = await Bootcamp.findById(req.params.id 
          
        );//findByIdAndDelete dosent work and the reason why is the remove middle ware wont be triggered
        if (!bootcamp) {
            return next(new errorResponse(`Bootcamp not found with id of ${req.params.id}`,404)
                );
             
        }
            // Make sure user is bootcamp owner
             if(bootcamp.user.toString()!== req.user.id && req.user.role !== 'admin'){
             return next(
             new errorResponse(
             `User ${req.params.id} is not authorized to update this bootcamp`,401)
             )};
            bootcamp.remove();//now that remove method is gonna trigger that middleware
             res.status(200)
            .json({
                success: true,
                data: {}
            });
    
       
    })

//dsc
//get bootcamps within a distance
// route Get /api/v1/bootcamps/radius/:zipcode/:distance
// access private
 exports.getBootcampsInRadius = asyncHandler(async(req, res, next) => {
        const{ zipcode , distance }=req.params;//pull stuff from the url
      
      //get lat/lag from geocoder
      const loc =await  geocoder.geocode(zipcode);
      const lat =loc[0].latitude;
      const lng =loc[0].longitude;
      //cal radius using radius
      //divide dist by radius of earth
      //earth radius =6,378 km
      const radius=distance / 3963 ;

      const bootcamps = await Bootcamp.find({
        location:
            {   $geoWithin:  {$centerSphere: [ [ lng, lat ], radius ] }}
        
      })
       res.status(200)
            .json({
                success: true,

                count:bootcamps.length,
                data:bootcamps
            });
     });

         //dsc
        //upload photo bootcamps
        // put Get /api/v1/bootcamps/id/photo
        // access private
        exports.bootcampPhotoUpload = asyncHandler(async(req, res, next) => {
    
        const bootcamp = await Bootcamp.findById(req.params.id );
        if (!bootcamp) {
            return next(new errorResponse(`Bootcamp not found with id of ${req.params.id}`,
                404)
                );
             
        }
        // Make sure user is bootcamp owner
           if(bootcamp.user.toString()!== req.user.id && req.user.role !== 'admin'){
             return next(
             new errorResponse(
             `User ${req.params.id} is not authorized to update this bootcamp`,401)
             )};
       
            //now we gonmna check a file is actually uploadet
            if(!req.files){
             return next(new errorResponse(`plese upload a file `,400));
            }
            

            const file =req.files.file //its an obj that contains all the info about your file 
            //make sure its an image
            if (!file.mimetype.startsWith('image')) {
            return next(new ErrorResponse(`Please upload an image file`, 400));
            }
            //LIMITING not more than 1000mg in our .env file
            //checking file size
            if(file.size > process.env.MAX_FILE_UPLOAD){
                return next(
                    new errorResponse(
                        `plese upload aN IMAGE less than process.env.MAX_FILE_UPLOA ${req.params.id}`
                        ,400
                        )
                    )
            }
            //create costum file name so it dosent overwrite it

            file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;
            //this will wont give me the original file name extension(the extension is jpg)
            //so we gonna use the path module

            file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
              if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
         await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name
    });
  });
});
