import projectModel from "../models/project.model.js";
import * as projectService from "../services/project.service.js"
import { validationResult } from 'express-validator'
import userModel from "../models/user.model.js"

export const createProjectController = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({erros:errors.array()})
	}
	try {
		const { name } = req.body;
		const loggedInUser = await userModel.findOne({ email: req.user.email })
		if (!loggedInUser) {
			return res.status(401).json({ message: "Unauthorized" });
		}
		const userId = loggedInUser._id;
		console.log(userId)
		const newProject = await projectService.createProject({ name, userId })
		res.status(201).json({ project: newProject });
	
	}
	catch (e) {
		res.status(500).json({ message: e.message});
	}
}

export const getAllProjectsController = async (req, res) => {
	try {
		console.log("inside get all project controller")
		console.log(req.user)
		const loggedInUser = await userModel.findOne({ email: req.user.email });
		const userId = loggedInUser._id;
		const allUserProjects = await projectService.getAllProjectByUserId({ userId })
		if (!allUserProjects) {
			return res.status(404).json({ message: "No projects found" });
		}
		return res.status(200).json({ projects: allUserProjects });

	}
	catch (e) {
		console.log(e);
		res.status(404).json({error: e.message})
	}

}

export const addUserToProjectController = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	try {
		const { projectId, users } = req.body;
		const loggedInUser = await userModel.findOne({ email: req.user.email });
		const userId = loggedInUser._id 
		const project = await projectService.addUsersToProject({ projectId, users, userId }) 
		return res.status(200).json({project });

	 }
	catch (e) {
		res.status(500).json({ message: e.message });
	}
}

export const getProjectByIdController = async (req, res) => {

	const { projectId } = req.params;
	
	try {
		const project = await projectService.getProjectById({ projectId })
		if (!project) {
			return res.status(404).json({ message: "Project not found" });
		}
		return res.status(200).json({ project });

		
	}
	catch (e) {
		res.status(400).json({ message: e.message });
	}
}

export const updateProjectController = async (req, res) => {
	console.log("yahena tak aaya")
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	try {
		const { projectId, fileTree } = req.body;
		
		const project = await projectService.updateFileTree({ projectId, fileTree }) 
		return res.status(200).json({ project });
		}
	catch (e) {
		console.log("error aaya")
		res.status(500).json({ message: e.message });
	}
}

