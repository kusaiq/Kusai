const 		path			    = require('path')
const       express             = require('express');
const       dotenv              = require('dotenv').config();
const       morgan              = require('morgan');
const       connectDB           = require('./config/db')
const 		colors 				= require('colors');
const 		fileUpload 			= require('express-fileupload');
const 		errorHandler 		= require('./middleware/error');
const 		bodyParser 			= require('body-parser');
const 		mongoSanitize 		= require('express-mongo-sanitize');
const		 helmet 			= require("helmet");
const 		xss 				= require('xss-clean')
const 		rateLimit 			= require("express-rate-limit");
const 		hpp 				= require('hpp');
const 		cors 				= require('cors');

//dotenv.config({ path: 'C:\Users\pc\Desktop\my web\node\config\.env'});



//coonect to the dadabase
connectDB();

//route files
const bootcamps = require('./routes/bootcamps');
const Courses = require('./routes/Courses');
const auth = require('./routes/auth');
const users = require('./routes/users');
const reviews = require('./routes/reviews');



const app = express();

//body-Parser
app.use(express.json());




//dev logging middleware
if (process.env.NODE_ENV == 'development') {
    app.use(morgan('dev'));
}

//file uploading
app.use(fileUpload());

//mongo sanatize (to prevent no sql injection)
app.use(mongoSanitize());

//prevents xss (cross site scripting)
app.use(helmet());

app.use(xss())

//PREVENET HTTP Parameter Pollution attacks
app.use(hpp()); 

app.use(cors())

//Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

//ser static folder
app.use(express.static(path.join(__dirname, 'public')));

//mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/Courses', Courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;


const server =app.listen(PORT,
    console.log(`server running in ${process.env.NODE_ENV} mode on port ${PORT}`.rainbow.bgBrightGreen));

//handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error:${err.message}`);
    //close server & exit process
    server.close(() => process.exit(1));
});