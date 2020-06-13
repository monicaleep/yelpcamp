const mongoose = require("mongoose");
const passportlocalmongoose = require('passport-local-mongoose')
//Schema setup
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin(passportlocalmongoose);

const User = mongoose.model("User", userSchema)
module.exports = User;
