import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import * as authMiddleware from "../middleware/auth.middleware.js";
const router = Router();

router.post(
  "/create",
  body("name").isString().withMessage("Name is required"),
  authMiddleware.authUser,
  projectController.createProjectController
);
router.get(
  "/all",
  authMiddleware.authUser,
  projectController.getAllProjectsController
);

router.put(
  "/add-user",
  body("users")
    .isArray({ min: 1 })
    .withMessage("User must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  body("projectId").isString().withMessage("Project ID is required"),
  authMiddleware.authUser,
  projectController.addUserToProjectController
);

router.get(
  "/get-project/:projectId",
  authMiddleware.authUser,
  projectController.getProjectByIdController
);

router.put(
  "/update-file-tree",
  body("projectId").isString().withMessage("Project ID is required"),
  body("fileTree").isObject().withMessage("File tree is required"),
  authMiddleware.authUser,
  projectController.updateProjectController
);



export default router;
