import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    trim: true,
    require: true,
    unique: [true, "Project name must be unique"],
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  fileTree: {
    type: Object,
    default: {}
  }
},{timestamps:true});

const project = mongoose.model("project", projectSchema)
export default project;