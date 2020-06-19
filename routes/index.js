const express = require("express");
const router = express.Router();
const passport = require('passport');
const User = require('../models/user')


//root route
router.get("/", (req, res) => {
  res.render("landing")
});

//show register FORM
router.get("/register",(req,res)=>{
  res.render('register',{page:'register'})
})

//handles sign up logic
router.post("/register",(req,res)=>{

  const newUser = new User({username: req.body.username,
                            isAdmin: req.body.adminCode === process.env.SECRET_CODE});
  User.register(newUser,req.body.password,(err,user)=>{
    if(err){
    //  console.log(err);
      req.flash("error",err.message)
      return res.redirect("/register");
    }
    passport.authenticate('local')(req,res,function(){
      req.flash("success","Welcome to Yelpcamp "+user.username)
      res.redirect("/campgrounds");
    });
  });
});

//show login form
router.get("/login",(req,res)=>{
  res.render('login',{page:'login'})
});



//logout ROUTE
router.get("/logout",(req,res)=>{
  req.logout();
  req.flash("success","Logged you out")
  res.redirect("/campgrounds")
})

//handling login logic
router.post("/login",passport.authenticate('local',{
    failureRedirect: "/login",
    failureFlash: true,
  }),function(req,res){
    req.flash("success","Logged in as "+req.body.username);
    res.redirect("/campgrounds");
  });


module.exports = router;
