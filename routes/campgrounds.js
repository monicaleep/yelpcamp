const express = require("express");
const router = express.Router();
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
const imageFilter = function(req, file, cb) {
  const filetypes = /jpeg|jpg/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb("Error: File upload only supports the following filetypes - " + filetypes);
};

const upload = multer({
  storage: storage,
  fileFilter: imageFilter
})
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'da6apwztz',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// INDEX
router.get("/", (req, res) => {
  // get all campgrounds from the DB
  Campground.find({}, (err, allcampgrounds) => {
    if (err) {
      console.log(err)
    } else {
      res.render("campgrounds/index", {
        campgrounds: allcampgrounds,
        page: 'campgrounds'
      })
    }
  })
})

//CREATE
router.post("/", middleware.isLoggedIn, upload.single('image'),async (req, res) => {
  // GET DATA FROM Req.user and add to req.body object
  req.body.campground.author = {
    id: req.user._id,
    username: req.user.username
  }
  //if user attached a file
  if (req.file) {
    await cloudinary.uploader.upload(req.file.path,
      {moderation:'webpurify'},
      function(err, result) {
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
    })    
    //else if user attached a URL instead
  } else {
    req.body.campground.image= req.body.imgurl;
  }
    Campground.create(req.body.campground,(err,cg)=>{
      if(err){
        console.log(err);
        req.flash('error',err.message)
        return res.redirect("back")
      }
      res.redirect("/campgrounds/" + cg.id)
    })
});


// NEW
router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new")
})

//SHOW.  shows more info about one campground
//this needs to be below /new as it's same format
router.get("/:id", (req, res) => {
  // find campground with that id
  Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
    if (err || !foundCampground) {
      console.log(err);
      req.flash("error", "Campground not found")
      res.redirect("/campgrounds")
    } else {
      //console.log(foundCampground)
      // show more infromation about that campground
      res.render("campgrounds/show", {
        campground: foundCampground
      })
    }
  })
})

// EDIT route
router.get('/:id/edit', middleware.checkCGOwnership, (req, res) => {
  //is user logged in
  Campground.findById(req.params.id, (err, foundCampground) => {
    res.render("campgrounds/edit", {
      campground: foundCampground
    })
  })
})

// UPDATE Route
router.put('/:id', middleware.checkCGOwnership, (req, res) => {
  //find and update
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCG) => {
    if (err) {
      console.log(err);
      res.redirect("/campgrounds")
    } else {
      //redirect somewhere - the show page
      res.redirect("/campgrounds/" + req.params.id)
    }
  })
});

//DESTROY ROUTE

router.delete("/:id", middleware.checkCGOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
    if (err) {
      console.log(err);
    }
    const public_id = campgroundRemoved.image;
    if(public_id.test(/cloudinary/)){

    }
    Comment.deleteMany({
      _id: {
        $in: campgroundRemoved.comments
      }
    }, (err) => {
      if (err) {
        console.log(err);
      }
      res.redirect("/campgrounds");
    });
  })
});




module.exports = router;
