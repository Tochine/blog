const express = require("express");

const router = express.Router();

const userController = require("./controllers/UserController");
const postController = require("./controllers/PostController");

// User related routes
router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Post related routes
router.get(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.viewCreateScreen
);

module.exports = router;
