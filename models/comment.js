const mongoose = require("mongoose");

//Schema setup
const commentSchema = new mongoose.Schema({
  text: String,
  author: String
});

const Comment = mongoose.model("Comment", commentSchema)
module.exports = Comment;
