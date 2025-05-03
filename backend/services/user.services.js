import userModel from "../models/user.model.js";
import mongoose from "mongoose";

export const createUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const hashPassword = await userModel.hashPassword(password);
  if (!hashPassword) {
    throw new Error("Error hashing password");
  }
	const user = await userModel.create({ email, password: hashPassword });
	  if (!user) {
	throw new Error("Error creating user");
  }
  return user;
};


export const loginUser = async ({ email, password }) => {
	
	if(!email || !password) {
		throw new Error("Email and password are required");
	}
	
	const user = await userModel.findOne({ email }).select("+password")
	if(!user) {
		throw new Error("User not found")
	}
	
	const isValidPassword = await user.isValidPassword(password)
	if(!isValidPassword) {
		throw new Error("Invalid password")
	}
	return user
}

export const getAllUsers = async ({ userId }) => {
	console.log(userId)
	const users = await userModel.find({ _id: { $ne: new mongoose.Types.ObjectId(userId) } });
	
	return users
  }