import mongoose from "mongoose";	
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true,
		minLenght: [6, 'Email must be at least 6 characters'],
		maxLength: [50, 'Email must be at most 32 characters'],
	},
	password: {
		type: String,
		select:false,
	},
})


userSchema.statics.hashPassword = async (password) => {
	
	return await bcrypt.hash(password, 10);


}

userSchema.methods.isValidPassword = async function (password) { 
	
	return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateJWT = function () {
	return jwt.sign({ email: this.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

const User = mongoose.model("User", userSchema);
export default User;