import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  team: {
    type: String,
    required: true,
  },
  googleId: {
    type: String,
    default: null,
  }
});

const User = mongoose.model("User", userSchema);
export default User;
