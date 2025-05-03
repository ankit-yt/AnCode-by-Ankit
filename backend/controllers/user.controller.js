import userModel from '../models/user.model.js'
import * as userServices from "../services/user.services.js"
import { validationResult } from "express-validator"
import redisClient from '../services/redis.services.js'

export const createUserController = async (req, res) => {
	const errors = validationResult(req)
	if(!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	try {
		const user = await userServices.createUser(req.body)
		const token = await user.generateJWT()
		res.status(201).json({user, token})
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
	
}

export const loginUserController = async (req, res) => {
	const errors = validationResult(req)
	if(!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	try {
		const user = await userServices.loginUser(req.body)
		const token = await user.generateJWT()
		res.status(200).json({user, token})
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

export const getUserProfileController = async (req, res) => { 
	return res.status(200).json({user: req.user})

}


export const logOutController = async (req, res) => {
	try {
		const token = req.cookies.token || req.headers.authorization.split(' ')[1]
		redisClient.set(token, "logout", 'EX', 60 * 60 * 24)	
		res.status(200).json({ message: "Logout successful" })
	}
	catch (error) {
		res.status(500).json({ message: error.message })
	}
}

export const getAllUsersController = async (req, res) => {
	try {
		const loggedInUser = await userModel.findOne({ email: req.user.email });
		const userId = loggedInUser._id;
		const allUsers = await userServices.getAllUsers({userId})
		res.status(200).json({users: allUsers})
		
	}catch (error) {
		res.status(500).json({ message: error.message })
	}
}