const express = require("express");
const router = express.Router();
const Campground = require('../models/campground');
const Comment = require('../models/comment')
// INDEX
router.get("/", (req, res) => {
  // get all campgrounds from the DB
  Campground.find({},(err,allcampgrounds)=>{
    if(err){
      console.log(err)
    } else {
      res.render("campgrounds/index",{
        campgrounds:allcampgrounds})
    }
  })
})

//CREATE
router.post("/", isLoggedIn,(req, res) => {
  // GET DATA FROM FORM AND ADD TO CAMPGROUNDS ARRAY
  const name = req.body.name;
  const image = req.body.image;
  const description = req.body.description;
  const author = {
    id: req.user._id,
    username: req.user.username
  }
  const newCampground = {
    name: name,
    image: image,
    description: description,
    author: author
  }
  //console.log(req.user)
  // create a new campground and save to the db
  Campground.create(newCampground, (err, newlycreated)=> {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds")
    } else {
      //console.log(newlycreated);
      res.redirect("/campgrounds")
    }
  })
})

// NEW
router.get("/new",isLoggedIn, (req, res) => {
  res.render("campgrounds/new")
})

//SHOW.  shows more info about one campground
//this needs to be below /new as it's same format
router.get("/:id",(req,res)=>{
  // find campground with that id
  Campground.findById(req.params.id).populate("comments").exec((err,foundCampground)=>{
    if(err){
      console.log(err);
      res.redirect("/campgrounds")
    } else {
      //console.log(foundCampground)
      // show more infromation about that campground
      res.render("campgrounds/show",{campground:foundCampground})
    }
  })
})

// EDIT route
router.get('/:id/edit',checkCGOwnership,(req,res)=>{
  //is user logged in
  Campground.findById(req.params.id,(err,foundCampground)=>{
    res.render("campgrounds/edit",{
      campground: foundCampground
    })
  })
})

// UPDATE Route
router.put('/:id',checkCGOwnership,(req,res)=>{
  //find and update
  Campground.findByIdAndUpdate(req.params.id,req.body.campground,(err,updatedCG)=>{
    if(err){
      console.log(err);
      res.redirect("/campgrounds")
    } else {
      //redirect somewhere - the show page
      res.redirect("/campgrounds/"+req.params.id)
    }
  })
});

//DESTROY ROUTE
router.delete("/:id",checkCGOwnership,async(req,res)=>{
  try {
    let foundCampground = await Campground.findById(req.params.id);
    // remove associated comments from the database - else memory leak!
    await foundCampground.comments.forEach(async(comment)=>{
      await Comment.findByIdAndDelete(comment._id)
    })
    await foundCampground.remove();
    res.redirect("/campgrounds");
  } catch (error) {
    res.redirect("/campgrounds");
  }
})

//middleware
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  } else {
    res.redirect("/login")
  }
}

function checkCGOwnership(req,res,next){
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


module.exports = router;
