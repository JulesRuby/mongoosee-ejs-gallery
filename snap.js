// Make sure this file is your 'main': in the package.json
const path = require('path');
const express = require('express');
// const controller = require('./controllers/controller'); //This is from a tutorial and I may well not need it
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient; //Tony's import module
const dotenv = require('dotenv').config();
var slugify = require('slugify');
const moment = require('moment');
const uri = process.env.MONGODB_URL;


//Model
const Image = require('./models/Images.js');

// Modules
const gallery = require('./gallery');
const pageAttributes = require('./pageAttributes');

//creating a year variable to pass into moment, will make app.locals further down. This doesn't save much time, I'm just trying to get the hang of how to use this.
const dateYear = 'YYYY'


// Setup app and engine 
const app = express();
app.set('view engine', 'ejs');


//app.locals
app.locals.dateYear = dateYear;
app.locals.moment = moment;
app.locals.starterImages = require('./gallery');


// Serve public/static assets 
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/views')));

//Fire controllers
// connects nback to the controller 
// controller(app);


// Handle POST requests from new image submissions. This would like be done through a form... Although I'm not toally certain how to actually use an image uploader yet.
app.use(express.urlencoded({ extended: false }));

// --- Global variables --- //
// app.use(function(req, res, next){
//   res.locals.currentIndex = ''; //leave this for now, not totally convinced I should blinbly copy/paste it. Seems like it isn't relvant to my code
//   res.locals.currentImage = ''; // seems like this is to set the a class to the current tab, styling it to visually let the user know where they are
//   next();                       // This basically ovverrides the if statement that I used in the code. It's probably a better way to do it      
// })


// // --- Run ejs --- //
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views')); // I have no idea why this part is here, I think it's probably either vestigial or redundant





//Tony's Module, access once I know I can connect//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // --- Dropping images into Mongo --- //
// MongoClient.connect(uri,{ useUnifiedTopology: true,useNewUrlParser: true },  function(err, client) {
//   if(err) {
//      console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
//   }
//   console.log('Connected...');

//   const db = client.db("gallery");
//   const imgCol = db.collection('images');

//   imgCol.deleteMany();
//   console.log('Dropped');

//   imgCol.insertMany(gallery).then(function(cursor) {
//    console.log(cursor.insertedCount);
//    client.close()
//  }).catch(function(err){
//    console.log(err);
//  });
// });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Mongoose connection //
//define  database URI as process.enc.MONGODB_URL, which is taken from the .env file's string
const dbURI = process.env.MONGODB_URL;
mongoose.connect(dbURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

// I guess that for now I just accept mongoose.connection is a baked in thing?
var db = mongoose.connection;


db.on('error', function(error){
  console.log(`Connection Error: ${error.message}`)
});

db.once('open', function() {
  console.log('Connected to DB...');
});


// GET Enpoint handlers
//Index Page rendered from the 
app.get('/', function(req, res){
  res.locals.index = pageAttributes.index;
  res.render('index', pageAttributes.index);
});

app.get('/about', function(req, res) {
  res.render('about', pageAttributes.about);
});

// app.get('/blog', function(req, res) {
//   res.render('blog', pageAttributes.blog);
// });

// app.get('/gallery', function(req, res) {
//   res.render('gallery', pageAttributes.gallery);
// }); 

app.get('/blog', function(req, res) {
  res.render('blog', pageAttributes.blog);
});
// I can do away with this part, if I can successfully get the Image.find to pull from the DB and populate it

  // res.locals.currentImage = 'current'; //I don't need this, as my current code already facilitates this. Maybe implement it after

  // Use the Image.js model I created to pull images from the Atlas. Anything in gallery, matching the object key value pairs
  // app.get('/gallery', function(req, res) {
  //   Image.find(function(error, result) {
  //     res.render('gallery', {gallery: result})
  //   });
  // });

  // app.get('/gallery', function(req, res) {
  //   Image.find({}, function(err, res) {
  //     if (err) throw err;
  //     res.render('gallery', {galleries: data});
  //   })
  // })


  app.get('/gallery', function(req, res) {
    Image.find(function(error, result) {
      // res.locals.gal = result;
      console.log(result)
      res.render('gallery', {images: result})
    });
  });
//   Image.find(function(error, result){
//     res.render('gallery', {gallery: result});
//   });
// });

//This still seems out of place, but it could be very useful...
// This is like... running a forEach loop on all of the images from the images folder, then if one of them matches the id of.. I guess the current picture's title will be rendered for use as the page's title.

// app.get('/gallery/:id', function(req, res) {
//   res.locals.imageID = req.params.id;
//   res.render('expandedCard', {});
// }); 
// console.log (gallery);
// app.get('/gallery/:id', function(req, res, next){
//   gallery.forEach(function(object){
//     // res.locals.imageID = req.params.id;
//     if(object.id === req.params.id){
//       res.render('expandedCard',{title: `${req.params.id}`});
//       return;
//     }
//   })
//   next();
// });


// I believe that the above code does not actually find the picture for the gallery, because it is returning the title: req.params.id, which is then supposed to be used to be used in the next code, to step into the database and look for the matching id? Although I don't think that this is really the way to write the code... It seems like maybe I should stick to id, instead of title. Also is the return even necessary? Is it possible to just use continue instead? Test more tomorrow.
app.get('/gallery/:id', function(req, res) {
  Image.findOne({id: req.params.id}, function(error, result){
    if(error){
      return console.log(error);
    }
    // res.locals.imageID = req.params.id;
    res.render('expandedCard', {image: result});
  });
});


/// insert post and slugify stuff here, if I think that I need it

// app.get('/blog', function(req, res) {
//   res.render('blog', pageAttributes.blog);
// });

// --- 404 error page --- //
app.use(function(req, res){
  // 
  // res.writeHead(404, {'Content-Type': 'text/html'});
  // fs.createReadStream(__dirname + '/404.html').pipe(res);   // This is only if I am using the fs modle
  res.status(404);
  res.send('404: File not found');
});


// --- Localhost: 3000 --- //
const PORT = process.env.PORT || 3000;

app.listen(PORT, function(){
  console.log(`Listening on port ${PORT}`);
});