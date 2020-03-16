// Establish required node package modules
const path = require('path');
const express = require('express');
const ejs = require('ejs');
const moment = require('moment');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient; // From Tony's module
const slugify = require('slugify');
const dotenv = require('dotenv').config();
//look into fs module

// Establish exports/custom mods
const Image = require('./models/Image.js');
const starterImages = require('./gallery');
const pageAttributes = require('./pageAttributes');

// variable to pass into moment().format(dateYear)
const dateYear = "YYYY";

const app = express();
// set view engine as ejs
app.set('view engine', 'ejs');

//////////////////////////////////////////////////////  ----- Test to see if I really need these later
app.locals.moment = require('moment');
app.locals.dateYear = dateYear;
// making the supplied images available throughout
app.locals.starterImages = starterImages;
//////////////////////////////////////////////////////////////

//-------------Middleware---------------------//

// server public directory
app.use(express.static(path.join(__dirname, 'public'))); 
// Not sure if this is really necessary, revisit
//app.use(express.static('public/images'));  //////

// post image// apparently this is post image but I'm not sure how?
app.use(express.urlencoded({ extended: false}));



// --- Mongoose connection --- //
const dataBaseURI = process.env.MONGODB_URL;
mongoose.connect(dataBaseURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

var db = mongoose.connection;


db.on('error', function(error){
  console.log(`Connection Error: ${error.message}`)
});

db.once('open', function() {
  console.log('Connected to DB...');
});

////////////////////////////
//GET endpoint handlers:
/////////////////////////////

app.get('/gallery', function(request, response){
  // Set global nav class for current tab
  response.locals.currentDefinitions = 'current';

  // Use Mongoose static model (i.e. one that is not instatiated) to pull definitions list from Atlas
  Definition.find(function(error, result) { 
    response.render('definitions',{definitions: result});
  });
});

app.get('/definitions/:slug', function(request,response){
  // Use Mongoose static model (i.e. one that is not instatiated) to pull one definition that matches the slug parameter
  Definition.findOne({slug: request.params.slug},function(error, result) { 
    if(error){
      return console.log(error);
    }
    response.render('definition',result);
  });
});


app.post('/definitions', function(request, response){
  // Auto generate slug using slugify() on term field
  request.body.slug = slugify(request.body.term);

  // Create an instance of our model using the data submitted from the form. This has not been inserted into the database.
  const definition = new Definition(request.body);

  // Save our instance to the database
  definition.save(function(error, def){
    if(error){
      return console.log(error);
    }
    // TODO: create session and add success/error message
    console.log(def);
  });
  // TODO: update index view to display success.error message
  response.redirect('/definitions');
});











// app.get('/gallery', function(request, response){
//   // Set global nav class for current tab
//   response.locals.currentImage = 'current';

//   // Use Mongoose static model (i.e. one that is not instatiated) to pull definitions list from Atlas
//   Image.find(function(error, result) { 
//     response.render('gallery',{gallery: result});
//   });
// });

// app.get('/gallery/:slug', function(request,response){
//   // Use Mongoose static model (i.e. one that is not instatiated) to pull one definition that matches the slug parameter
//   Image.findOne({slug: request.params.slug},function(error, result) { 
//     if(error){
//       return console.log(error);
//     }
//     response.render('gallery',result);
//   });
// });

///////////////////////////////////

// Retrieve information from pageAttributes to render and use template varibles throughout the website
app.get('/', function(req, res) {
  res.render('index', pageAttributes.index);
});

app.get('/about', function(req, res) {
  res.render('about', pageAttributes.about);
});

app.get('/gallery', function(req, res) {
  res.render('gallery', pageAttributes.gallery);
});


//Make the imageID that of the id from the requested data
app.get('/gallery/:id', function(req, res) {
  app.locals.imageID = req.params.id;
  res.render('expandedCard', {});
});

// trying to figure out a way to potentially dynamically create the title attributes for the expanded image... I don't have enough time right now.

app.get('/gallery/:id', function(req, res, next){
  starterImages.forEach(function(object){
    if(object.id == req.params.id){
      res.render('expandedCard',{title: `${req.params.id}`});
      return;
    }
  })
  next();
});

app.get('/blog', function(req, res) {
  res.render('blog', pageAttributes.blog);
});




app.use(function(req,res,next) {
  res.status(404);
  res.send(`404 not found!`);
});


// PORT defaults to 3000 unless a different one is specified
const PORT = process.env.PORT || 3000; 

app.listen(PORT, function() {
  console.log(`Listening on port: ${PORT}`);
});
