const express = require('express');


const { getReviews,getReview,addReview,updateReview,deleteReview
    
} = require('../controllers/Reviews');

//requiring the model because its used in our middelware
const Reviews = require('../models/Reviews');

const router = express.Router({ mergeParams:true });//because we are merging the url params
//requiring our middleware
const advancedResults = require('../middleware/advancedResults');
const { protect,authorize }=require('../middleware/auth');



router
    .route('/')
    .get(advancedResults(Reviews,{path:'bootcamp',select:'name description'}),getReviews)
    .post(protect, authorize('user', 'admin'), addReview);

    router
    .route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview);
    
    


    


   
    

    module.exports = router;