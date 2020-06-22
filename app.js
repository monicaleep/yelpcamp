const express = require("express"),
      bodyParser = require("body-parser"),
      mongoose = require("mongoose"),
      passport = require('passport'),
      flash = require('connect-flash'),
      localStrategy = require('passport-local'),
      methodOverride = require('method-override'),
      Campground = require("./models/campground"),
      Comment = require("./models/comment"),
      User = require("./models/user"),
      session = require('express-session'),
    //  MongoDBStore = require('connect-mongodb-session')(session),
      MongoStore = require('connect-mongo')(session),
      app =  express();
     //  seedDB = require("./seed");

require('dotenv').config();


const PORT = process.env.PORT || 3000;
const OPTIONS = {
  useUnifiedTopology:true ,
  useNewUrlParser:true,
  useFindAndModify: false,
  useCreateIndex: true
}

mongoose.connect(process.env.URL,OPTIONS)
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

app.use(express.static(__dirname+"/public")); //use the public folder to serve custom assets
app.use(methodOverride("_method")); //use method override to do put and delete requests in express
app.use(flash()); //flash messages
//seedDB();// seeds the Database
app.locals.moment = require('moment')
//passport config
app.use(session({
  secret:"Once again rusty wins cutest dog",
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//this middleware runs before every single route
app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  //console.log(res.locals.currentUser);
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next()
})


//requiring routes
const commentRoutes =   require("./routes/comments"),
      campgroundRoutes =  require("./routes/campgrounds"),
      indexRoutes =       require("./routes/index");
app.use("/",indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
//all routes for campgrounds page, start with /campgrounds
app.use("/campgrounds",campgroundRoutes);


app.listen(PORT, () => {
  console.log(`YelpCamp has started on port ${PORT}`)
})
