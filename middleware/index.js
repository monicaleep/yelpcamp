const Campground = require('../models/campground');
// All the middleware
const middlewareObj = {};

middlewareObj.checkCGOwnership = function(req,res,next){
  if(req.isAuthenticated()){
    Campground.findById(req.params.id,(err,foundCampground)=>{
      if(err){
        console.log(err);
        res.redirect('back')
      } else{
        // does user own campground?
        if(foundCampground.author.id.equals(req.user._id)){
          next()
        } else {
          // otherwise redirect
          res.redirect('back')
        }
      }
    })
    // if not, redirect
  } else {
    res.redirect("back")
  }
}


middlewareObj.checkCommentOwnership = function(req,res,next){
  if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id,(err,foundComment)=>{
      if(err){
        console.log(err);
        res.redirect('back')
      } else{
        // does user own comment?
        if(foundComment.author.id.equals(req.user._id)){
          next()
        } else {
          // otherwise redirect
          res.redirect('back')
        }
      }
    });
    // if not, redirect
  } else {
    res.redirect("back")
  }
}

middlewareObj.isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect("/login")
  }
}
module.exports = middlewareObj;
