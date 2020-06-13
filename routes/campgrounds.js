const express = require("express");
const router = express.Router();
const Campground = require('../models/campground')

// INDEX
router.get("/campgrounds", (req, res) => {

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

//NEW
router.post("/campgrounds", (req, res) => {
  // GET DATA FROM FORM AND ADD TO CAMPGROUNDS ARRAY
  const name = req.body.name;
  const image = req.body.image;
  const description = req.body.description;
  const newCampground = {
    name: name,
    image: image,
    description: description
  }
  // create a new campground and save to the db
  Campground.create(newCampground, (err, newlycreated)=> {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds")
    } else {
      res.redirect("/campgrounds")
    }
  })
})

//SHOW.  shows more info about one campground
//this needs to be below /new as it's same format
router.get("/campgrounds/:id",(req,res)=>{
  // find campground with that id
  Campground.findById(req.params.id).populate("comments").exec((err,foundCampground)=>{
    if(err){
      console.log(err);
      req.redirect("/campgrounds")
    } else {
      //console.log(foundCampground)
      // show more infromation about that campground
      res.render("campgrounds/show",{campground:foundCampground})
    }
  })
})

// Create
router.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new")
})


module.exports = router;
