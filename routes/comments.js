const express = require("express");
const router = express.Router();
const Campground = require('../models/campground')
const Comment = require('../models/comment')

// ===== Comments Routes
router.get("/campgrounds/:id/comments/new",isLoggedIn,(req,res)=>{
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


router.post("/campgrounds/:id/comments",isLoggedIn,(req,res)=>{

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
          cg.comments.push(comment);
          cg.save();
          //console.log(cg);
          res.redirect("/campgrounds/"+cg._id);
        }
      })
    }
  })
});
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect("/login")
  }
}
module.exports = router;
