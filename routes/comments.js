const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Comment = require('../models/comment');

//comments new
router.get("/new",isLoggedIn,(req,res)=>{
  //when we moved "/campgrounds/:id/comments" out to app.js via express router. fixed on line 2 with mergeParams
  //console.log(req.params.id);
  Campground.findById(req.params.id,(err,cg)=>{
    if(err){
      console.log(err)
    } else{
      res.render("comments/new",{
        campground: cg
      })
    }
  })
})

//comments create
router.post("/",isLoggedIn,(req,res)=>{
  //lookup campground using ID
  Campground.findById(req.params.id,(err,cg)=>{
    if(err){
      console.log(err);
      res.redirect("/campgrounds")
    } else {
      //create new comment
      Comment.create(req.body.comment,(err,comment)=>{
        if(err){
          console.log(err)
        } else {
          //add the username and id to the comment
          //console.log(comment)
          //console.log(req.user)
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          // save the comment
          comment.save();
          cg.comments.push(comment);
          cg.save();
          console.log(cg);
          console.log(comment);
          res.redirect("/campgrounds/"+cg._id);
        }
      })
    }
  })
});

//middleware
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect("/login")
  }
}
module.exports = router;
