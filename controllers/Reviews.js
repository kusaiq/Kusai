const errorResponse = require ('../utils/errorResponse');//I say what the error is
const asyncHandler = require('../middleware/async')//no more try catch
const Bootcamp = require('../models/Bootcamps');
const Review = require('../models/Reviews');

//Here we are working on the review model we can show reviews that users wrote

//dsc
//get all Reviews
// route Get /api/v1/reviews
// route Get /api/v1/bootcamps/:bootcampId/reviews
// access public
exports.getReviews = asyncHandler(async (req, res, next) => {
		//first lets check if there is a bootcamp id
		if(req.params.bootcampId){
		const reviews = await Review.find({bootcamp:req.params.bootcampId})
		if(!reviews){
			return next(new errorResponse(`review not found on the bootcamp with the following id ${req.params.bootcampId}`,404));
		}else{
		return res.status(200).json({success:true ,Review:reviews.length ,data : reviews})
		}
		}
		else{
			//either the user clicks on the review button on a certain bootcam
       //know we can use the advanced results when finding them all
       //also in the advanced results we can populate the bootcamp id and name
       res.status(200).json(res.advancedResults);
		}
    });
// @desc      Get single review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description'
  });

  if (!review) {
    return next(
      new errorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc      Add review
// @route     POST /api/v1/bootcamps/:bootcampId/reviews
// @access    Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new errorResponse(
        `No bootcamp with the id of ${req.params.bootcampId}`,
        404
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc      Update review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new errorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new errorResponse(`Not authorized to update review`, 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: review
  });
});

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new errorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new errorResponse(`Not authorized to update review`, 401));
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
