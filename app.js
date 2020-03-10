// Establish required node package modules
const path = require('path');
const express = require('express');
const ejs = require('ejs');
const moment = require('moment');

// Establish my personal modules
const starterImages = require('./gallery');
const pageAttributes = require('./pageAttributes');

// Establish variables 
// assign a striong to dateYear to pass as an argument into the format() of the moment()
const dateYear = "YYYY";

const app = express();

// make these accessible throughout my ejs 
app.locals.moment = require('moment');
app.locals.dateYear = dateYear;

// making the supplied images available throughout
app.locals.starterImages = starterImages;

// Define the 'view engine' that we'll be using. In this case it will be ejs, but it could be something like pug or handlebars
app.set('view engine', 'ejs');

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


// This is an attempt to add in data to the pageAttributes to pass to the expanded animal picture, but it's not very dynamic, animal-to-animal
// app.get('/gallery', function(req, res) {
//   res.render('gallery', pageAttributes.galleryExpanded);
// });

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


app.use(express.static(path.join(__dirname, 'public'))); 

app.use(function(req,res,next) {
  res.status(404);
  res.send(`404 not found!`);
});


// PORT defaults to 3000 unless a different one is specified
const PORT = process.env.PORT || 3000; 

app.listen(PORT, function() {
  console.log(`Listening on port: ${PORT}`);
});
