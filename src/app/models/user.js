import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

// Avoid model overwrite on hot reload
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
