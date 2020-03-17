// Make sure this file is your 'main': in the package.json, because I switched to snap.js from app.js, while doing large mutations on my previous work, for testing purposes.
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient; //MongoDB connection used in the import module
const dotenv = require('dotenv').config();
const moment = require('moment');
// 
const uri = process.env.MONGODB_URL;


/////////////////////// Models/Shcema //////////////////////////
const Image = require('./models/Images.js');

////////////////////// Modules /////////////////////////////////

// Gallery won't really be needed for this assignment any longer, as I am now extracting that data from the db, but keeping it for referencing
const gallery = require('./gallery');
// I'm trying to figure out to use the values from pageAttributes.js still, to dynamically render the title and stuff on the views, along side the database calls that populate the gallery. I haven't found out how to really pass data from multiple sources in and have it properly render the page, and it is frustrating me. Maybe If I tried an app.use, similar to how Tony did to assign a class to the current nav-link??
const pageAttributes = require('./pageAttributes');


//creating a year variable to pass into moment, will make app.locals further down. This doesn't save much time, I'm just trying to get the hang of how to use this.
const dateYear = 'YYYY'


////////////////////// App and Engine /////////////////////////////////
const app = express();
app.set('view engine', 'ejs');


////////////////////// app.locals /////////////////////////////////
app.locals.dateYear = dateYear;
app.locals.moment = moment;
app.locals.starterImages = require('./gallery');


////////////////////// Serve static assets /////////////////////////////////
// Don't really need the /views one right now, I don't think. Just experimenting with ideas.
app.use(express.static(path.join(__dirname, '/public')));
// app.use(express.static(path.join(__dirname, '/views')));



////////////////////// POST middleware /////////////////////////////////
// I think this is to  
//Handle POST requests from new image submissions. 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


////////////////////// Global variables used for navigation emphasis /////////////////////////////////
// Set variables that will inherit the "current-page" value when the corresponing page is visited, which passes into the nav-link the class="current-page", which styles the link to be emphasized to tell the user which page they are on.
app.use(function(req, res, next){
  res.locals.currentIndex = ''; 
  res.locals.currentAbout = '';
  res.locals.currentGallery = '';
  res.locals.currentBlog = ''; 
  next();                     
})


////////////////////// Mongoose Connection /////////////////////////////////
//define  database URI as process.enc.MONGODB_URL, which is taken from the .env file's string, for encryption purposes
const dbURI = process.env.MONGODB_URL;
mongoose.connect(dbURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

// Get mongoose to deal with all the nitty gritty connection stuff
var db = mongoose.connection;

// Create console logs for success/failure when connecting to the db
db.on('error', function(error){
  console.log(`Connection Error: ${error.message}`)
});

db.once('open', function() {
  console.log('Connected to DB...');
});


////////////////////// GET Handlers /////////////////////////////////
app.get('/', function(req, res){
  res.locals.currentIndex = 'current-page';
  res.render('index', pageAttributes.index);
});

app.get('/about', function(req, res) {
  res.locals.currentAbout = 'current-page'
  res.render('about', pageAttributes.about);
});

app.get('/blog', function(req, res) {
  res.locals.currentBlog = 'current-page'
  res.render('blog', pageAttributes.blog);
});

app.get('/gallery', function(req, res) {
  res.locals.currentGallery = 'current-page'
  // use image model to return all matching Schema from the db
  Image.find(function(error, result) {

    if(error){
      return console.log(error);
    };
    
    // Render page using the returned object data, and matching the info with the images stored in public
    res.render('gallery', {images: result})
  });
});


app.get('/gallery/:id', function(req, res) {
  // Find one image in the db, matching the id passed in from the url endpoint
  Image.findOne({id: req.params.id}, function(error, result){
    
    if(error){
      return console.log(error);
    };
    // render the expanded card page from the data take from the selected endpoint
    res.render('expandedCard', {image: result});
  });
});



// Handling the 404 error, if I find time, I'll make a style page redirect for this, I think... Have to look into the fs module more
app.use(function(req, res){
  
  // Two of these lines are something from an fs module, I'm keeping them for reference, but not using them in the scope of this assignment -- no time
  // res.writeHead(404, {'Content-Type': 'text/html'});
  // fs.createReadStream(__dirname + '/404.html').pipe(res);   // This is only if I am using the fs modle
  res.status(404);
  res.send('404: File not found');
});


// assign PORT to default to 3000 for the local host, if no other PORt has been decided by the user or the db
const PORT = process.env.PORT || 3000;

// Begin listening to the port
app.listen(PORT, function(){
  console.log(`Listening on port ${PORT}`);
});