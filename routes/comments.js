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
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          // save the comment
          comment.save();
          cg.comments.push(comment);
          cg.save();
          res.redirect("/campgrounds/"+cg._id);
        }
      })
    }
  })
});


//EDIT route
router.get("/:comment_id/edit",checkCommentOwnership,(req,res)=>{
  Comment.findById(req.params.comment_id,(err,foundComment)=>{
    if(err){
      res.redirect("back")
    } else {
      res.render("comments/edit",{
        campground_id: req.params.id, //id is definted in app.js and refers to campground id
        comment: foundComment
      })
    }
  })
})

//Update route
router.put("/:comment_id",checkCommentOwnership,(req,res)=>{
  Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,(err,updatedComment)=>{
    if(err){
      console.log(err);
      res.redirect('back');
    } else {
      res.redirect("/campgrounds/"+req.params.id)
    }
  })
})

//COMMENT DESTROY ROUTE
router.delete("/:comment_id",checkCommentOwnership,(req,res)=>{
  Comment.findByIdAndRemove(req.params.comment_id,(err)=>{
    if(err){
      res.redirect('back')
    } else {
      res.redirect('/campgrounds/'+req.params.id)
    }
  })
})


//middleware
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect("/login")
  }
}

function checkCommentOwnership(req,res,next){
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
module.exports = router;
