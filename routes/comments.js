const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');

//comments new
router.get("/new",middleware.isLoggedIn,(req,res)=>{
  //when we moved "/campgrounds/:id/comments" out to app.js via express router. fixed on line 2 with mergeParams
  //console.log(req.params.id);
  Campground.findById(req.params.id,(err,cg)=>{
    if(err || !cg){
      console.log(err)
    } else{
      res.render("comments/new",{
        campground: cg
      })
    }
  })
})

//comments create
router.post("/",middleware.isLoggedIn,(req,res)=>{
  //lookup campground using ID
  Campground.findById(req.params.id,(err,cg)=>{
    if(err){
      console.log(err);
      req.flash("error","Something went wrong!")
      res.redirect("/campgrounds")
    } else {
      //create new comment
      Comment.create(req.body.comment,(err,comment)=>{
        if(err){
          console.log(err)
          req.flash("error","Something went wrong!")
          res.redirect("/campgrounds")
        } else {
          //add the username and id to the comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          // save the comment
          comment.save();
          cg.comments.push(comment);
          cg.save();
          req.flash("success","You added a comment")
          res.redirect("/campgrounds/"+cg._id);
        }
      })
    }
  })
});


//EDIT route
router.get("/:comment_id/edit",middleware.checkCommentOwnership,(req,res)=>{
  Campground.findById(req.params.id,(err,cg)=>{
    if(err || !cg){
      req.flash("error","Campground not found");
      return res.redirect('/campgrounds')
    }
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
})

//Update route
router.put("/:comment_id",middleware.checkCommentOwnership,(req,res)=>{
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
router.delete("/:comment_id",middleware.checkCommentOwnership,(req,res)=>{
  Comment.findByIdAndRemove(req.params.comment_id,(err)=>{
    if(err){
      res.redirect('back')
    } else {
      req.flash("success","Comment Deleted")
      res.redirect('/campgrounds/'+req.params.id)
    }
  })
})




module.exports = router;
