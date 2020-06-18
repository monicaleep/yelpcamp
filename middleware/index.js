const Campground = require('../models/campground');
// All the middleware
const middlewareObj = {};

middlewareObj.checkCGOwnership = function(req,res,next){
  if(req.isAuthenticated()){
    Campground.findById(req.params.id,(err,foundCampground)=>{
      if(err || !foundCampground){
        console.log(err);
        req.flash("error","Campground not found")
        res.redirect('back')
      } else{
        // does user own campground?
        if(foundCampground.author.id.equals(req.user._id)){
          next()
        } else {
          req.flash("error","You are not authorized to edit")
          // otherwise redirect
          res.redirect('back')
        }
      }
    })
    // if not, redirect
  } else {
    req.flash("error","You need to be logged in to do that!")
    res.redirect("back")
  }
}


middlewareObj.checkCommentOwnership = function(req,res,next){
  if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id,(err,foundComment)=>{
      if(err || !foundComment){
        console.log(err);
        req.flash("error","Comment not found")
        res.redirect('back')
      } else{
        // does user own comment?
        if(foundComment.author.id.equals(req.user._id)){
          next()
        } else {
          // otherwise redirect
          req.flash("You don't have permission to do that")
          res.redirect('back')
        }
      }
    });
    // if not, redirect
  } else {
    req.flash("You need to be logged in to do that")
    res.redirect("back")
  }
}

middlewareObj.isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    req.flash('error',"You need to be logged in to do that!")
    res.redirect("/login")
  }
}
module.exports = middlewareObj;
