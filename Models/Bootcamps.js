const mongoose = require('mongoose');
const slugify  = require('slugify');
const geocoder  =require('../utils/geocoder')
const  BootcampSchema = new mongoose.Schema({
    name: {
        type : String,
        required: [true, 'please add a name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters ']
    },
    slug    : String,
    description: {
        type :String,
        required: [true, 'please add a name'],
        trim: true,
        maxlength: [500, 'description can not be more than 50 characters ']

    },
    website: {
        type: String,
        match: [/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi
            , 'please use a valid URL with HTTP or HTTP5']
    },
    phone: {
        type: String,
        maxlength: [20, 'phone number can not be longer than 20 characters']
    },
    email: {
        type: String,
        match: [/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'please use a valid email'
        ]
    },
    address:{
        type:String,
        required:[true,'add an address']
    },
    location:{
        //geojson
        type:{
            type:String,
            enum:['Point'],
            
        },
        coordinates:{
            type:[Number],
            
            index :'2dsphere'
        },
        formattedAddress:String,
        street:String,
        city:String,
        state:String,
        zipcode:String,
        country:String
        
    },
    careers:{
        //array of strings
        type:[String],
        required:true,
        enum:[//enum means the only avalible value
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]

    },
    averageRating:{
        type:Number,
        min:[1,'Rating must be at least 1'],
        max:[10,'Rating can not be more than 10']
    },
    averageRating: Number,
    photo:{
        type:String,
        default:'no-photo.jpg'
    },
    housing:{
        type:Boolean,
        default:false

    }, jobAssistance:{
        type:Boolean,
        default:false
    }, jobGuarantee:{
        type:Boolean,
        default:false
    }, acceptGi:{
        type:Boolean,
        default:false
    }, createdAT:{
        type:Date,
        default:Date.now
    },
    averageCost:{
        type:Number
    },  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
     
        
    


},
//reverse populate (virtual populate),setting virtuals to true
{
    toJSON:
    {virtuals:true
    },
    toObject:{virtuals:true
    }
}
);

//create bootcamp slug from the name
BootcampSchema.pre('save',function(next){ ///this will run before it is saved
  this.slug=slugify(this.name,{lower    : true}) 
  next(); 
}); 

//geocode and create location filed
BootcampSchema.pre('save',async function(next){ ///this will run before it is saved
  const loc = await geocoder.geocode(this.address);
  this.location={
    type:'Point',
    coordinates:[loc[0].longitude,loc[0].latitude],
    formattedAddress:loc[0].formattedAddress,
    street:loc[0].streetName,
    city:loc[0].city,
    state:loc[0].stateCode,
    zipcode:loc[0].zipCode,
    country:loc[0].countryCode
    

  }
  //do not save address in DB
   this.address=undefined;

  next(); 
}); 

//cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove',async function(next){
    console.log(`courses begin removed from bootcamp ${this._id}`);
    await this.model('Course').deleteMany({ bootcamp: this._id });//we dont have to bring in the course model we can use this
    //when we used deletMany we wanna make sure to delete the courses that are part of the bootcamp that is removed
    //delete many will delete all the documents that matches the condition
    next(); 
})

//create the virtual on the schema(reverse populate)
BootcampSchema.virtual('courses',{//the first argument is the filed that wa wanna add as a virtual
ref:'Course',//rferencing to the model we are using or virtual
localField:'_id',
foreignField:'bootcamp',//in the ref model we need to find the model that is refrenced within the model witch is courses
justOne:false //we wanna see an array of courses
})//with that now we can revers populate


module.exports = mongoose.model('Bootcamp', BootcampSchema);