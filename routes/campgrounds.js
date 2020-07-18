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
router.post("/", middleware.isLoggedIn, upload.single('image'), async (req, res) => {
  // GET DATA FROM Req.user and add to req.body object
  req.body.campground.author = {
    id: req.user._id,
    username: req.user.username
  }
  //if user attached a file
  if (req.file) {
    await cloudinary.uploader.upload(req.file.path, {
        moderation: 'webpurify'
      },
      function(err, result) {
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        req.body.campground.imageId = result.public_id;
      })
    //else if user put a URL instead
  } else {
    req.body.campground.image = req.body.imgurl;
  }
  Campground.create(req.body.campground, (err, cg) => {
    if (err) {
      console.log(err);
      req.flash('error', err.message)
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
router.put('/:id', middleware.checkCGOwnership, upload.single('image'), (req, res) => {
  //find and update
  Campground.findById(req.params.id, async (err, updatedCG) => {
    if (err) {
      req.flash("error", err.message);
      return res.redirect('back');
    } else {
      //handle case where user uploads and image and changes the URL
      if (req.file && req.body.imgurl != updatedCG.image) {
        req.flash("error", "You can upload an image or change its URL, but not both");
        return res.redirect("back");
      }
      //if image is uploaded or URL is changed
      if (req.file || req.body.imgurl != updatedCG.image) {
        //if old image is cloudinary, remove it
        try {
          if ((/cloudinary/).test(updatedCG.image)) {
            await cloudinary.uploader.destroy(updatedCG.imageId);
          }
          //if new image is upload, upload it;
          if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            updatedCG.image = result.secure_url;
            updatedCG.imageId = result.public_id;
          } else {
            //if new image isjust a url
            updatedCG.image = req.body.imgurl;
            updatedCG.imageId = "";
          }
        } catch (err) {
          console.log(err)
        }
      }
      updatedCG.name = req.body.campground.name;
      updatedCG.price = req.body.campground.price;
      updatedCG.description = req.body.campground.description;
      updatedCG.save();
      req.flash("success", "Updated " + req.body.campground.name);
      res.redirect("/campgrounds/" + updatedCG._id)
    }
  })
});


//DESTROY ROUTE
router.delete("/:id", middleware.checkCGOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, async (err, campgroundRemoved) => {
    if (err) {
      req.flash("error", "An error occurred: " + err.message);
      return res.redirect("back");
    }
    const public_id = campgroundRemoved.image;
    if (public_id && (/cloudinary/).test(public_id)) {
      try {
        await cloudinary.uploader.destroy(campgroundRemoved.imageId);
        console.log("Deleted image")
      } catch (err) {
        req.flash("error", err.message);
        return res.redirect("back");
      }
    }
    Comment.deleteMany({
      _id: {
        $in: campgroundRemoved.comments
      }
    }, (err) => {
      if (err) {
        console.log(err);
      }
      req.flash("success","Successfully deleted "+campgroundRemoved.name)
      res.redirect("/campgrounds");
    });
  })
});




module.exports = router;
