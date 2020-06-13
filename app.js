const express = require("express"),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      passport = require('passport'),
      localStrategy = require('passport-local'),
      Campground = require("./models/campground"),
      Comment = require("./models/comment"),
      User = require("./models/user"),
      app =  express(),
      seedDB = require("./seed");

//requiring routes
const commentRoutes =   require("./routes/comments"),
    campgroundRoutes =  require("./routes/campgrounds"),
    indexRoutes =       require("./routes/index");

const PORT = process.env.PORT || 3000;
const OPTIONS = {
  useUnifiedTopology:true ,
  useNewUrlParser:true,
  useFindAndModify: false,
  useCreateIndex: true
}
mongoose.connect("mongodb://localhost/yelpcamp",OPTIONS)
  .then(()=>{
    console.log('MongoDB connected')
  })
  .catch((err)=>{
    console.log(err);
  });



app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({
  extended: true
}))
//use the public folder to serve custom assets
app.use(express.static(__dirname+"/public"))
seedDB();

//passport config
app.use(require('express-session')({
  secret:"Once again rusty wins cutest dog",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//this middleware runs before every single route
app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  console.log(res.locals.currentUser)
  next()
})

app.use("/",indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
//all routes for campgrounds page, start with /campgrounds
app.use("/campgrounds",campgroundRoutes);

app.listen(PORT, () => {
  console.log(`YelpCamp has started on port ${PORT}`)
})