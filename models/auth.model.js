import mongoose from "mongoose";

const authSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 100,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
});

const Auth = mongoose.model("Auth", authSchema);

export default Auth;
