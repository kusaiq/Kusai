const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,//i think its space between the words
    required: [true, 'Please add a course title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  weeks: {
    type: String,
    required: [true, 'Please add number of weeks']
  },
  tuition: { 
    type: Number,
    required: [true, 'Please add a tuition cost']
  },
  minimumSkill: {
    type: String,
    required: [true, 'Please add a minimum skill'],
    enum: ['beginner', 'intermediate', 'advanced'] //enum means i want it to be only one of three values
  },
  scholarshipAvailable: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  bootcamp: {
    type: mongoose.Schema.ObjectId,
    ref: 'Bootcamp',
    required: true
  }
  });

//  static method to get avg of course tutions
CourseSchema.statics.getAverageCost =async function(bootcampId){//when we run Course.getAverageCoast this function will trigger
    console.log('calculating avg cost'.blue);
    //now we gonna call a method that is called aggregate witch returns a promise so we are using awiat
    const obj = await this.aggregate([
    {
      $match :  { bootcamp: bootcampId}//quick hint even thou we are using $group its recommended to call $match  
      //as soo as possiple and the reason why is to minimize processing time
    },
    {
      $group:{//simply will group the bootcamp with this certain id and it will do some acumulator that you specify

        _id:'$bootcamp',//group take input document and in our case the thing we wanaa group is the bootcampId

        averageCost: { $avg: '$tuition' }//acumelators can be a little hard in the begining
        //here is my tip for you first think about the filed you wanna add or acumumulate then think about what is the input and the output
        //in our case the input was the avgcost witch is undentified and our acummulate is the output that  we wanna acumulate 

      } 
    }
      ]);
    console.log(obj)
    //put avgcost in the data base
    try{
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
        averageCost: Math.ceil(obj[0].averageCost / 10) * 10
      });//it takes in the bootcamp id and what we wanna update
        } catch(err) {
            console.log(err)
    }
    };


//call getAverageCost after save (because we wnat it to run after posting)
CourseSchema.post('save',function(){
this.constructor.getAverageCost(this.bootcamp);//the first this referese to the obj (the static method) the second witch is the bootcamp id
});

//call getAverageCost before remove (because the avg coast will change)
CourseSchema.pre('remove',function(){
this.constructor.getAverageCost(this.bootcamp);
});
module.exports = mongoose.model('Course', CourseSchema);