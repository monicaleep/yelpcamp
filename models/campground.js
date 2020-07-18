const mongoose = require("mongoose");

//Schema setup
const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  imageId: String,
  description: String,
  price: String,
  createdAt: {type: Date, default: Date.now},
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]
});

// a pre-hook from remove, which will remove all associated comments from the comments db
// campgroundSchema.pre("remove",async function(){
//    await Comment.deleteMany({
//       _id:{
//          $in:this.comments
//       }
//    });
// });

const Campground = mongoose.model("Campground", campgroundSchema)
module.exports = Campground;
