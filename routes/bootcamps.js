const express = require('express');

const { getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');

//requiring the model because its used in our middelware
const Bootcamp = require('../models/Bootcamps');

//include other rsourse routers
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

//requiring our middleware
const advancedResults = require('../middleware/advancedResults');

const router = express.Router();

const { protect ,authorize}=require('../middleware/auth');

//Re-route into other resourse
router.use('/:bootcampId/courses',courseRouter)//whats basically saying anything with the bootcampId we want to mount that into the courseRpoter
//so its bascically gonna pass it on to the course router so when it hits its gonna go cntinue on to the other file
//we can kinda look at this as forwading
router.use('/:bootcampId/reviews',reviewRouter)

router
.route('/radius/:zipcode/:distance')
.get(getBootcampsInRadius)

router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'),getBootcamps)
    .post(protect,authorize('publisher','admin'),createBootcamp);

router
    .route('/:id')
    .get(getBootcamp)
    .put(protect,authorize('publisher','admin'),updateBootcamp)
    .delete(protect,authorize('publisher','admin'),deleteBootcamp);

    router
    .route('/:id/photo')//so when we do a put req to this route (bootcampPhotoUpload)will fire off
    .put(protect,authorize('publisher','admin'),bootcampPhotoUpload)


module.exports = router;
