const express = require("express");
const router = express.Router();


router.get("/", (req, res) => {
  res.render("landing")
});


// =========
//AUTH ROUTES
// =========

//show register FORM
router.get("/register",(req,res)=>{
  res.render('register')
})

router.post("/register",(req,res)=>{
  const newUser = new User({username: req.body.username});
  User.register(newUser,req.body.password,(err,user)=>{
    if(err){
      console.log(err);
      res.render("register");
      return
    }
    passport.authenticate('local')(req,res,function(){
      res.redirect("/campgrounds");
    });
  });
});

//show login form
router.get("/login",(req,res)=>{
  res.render('login')
});
//handling login logic
router.post("/login",passport.authenticate('local',{
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
  }));
//logout ROUTES
router.get("/logout",(req,res)=>{
  req.logout();
  res.redirect("/campgrounds")
})


//our middleware which uses passport to check if user is logged in
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect("/login")
  }
}
