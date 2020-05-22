const express = require("express");

const router = express.Router();

const userController = require("./controllers/UserController");
const postController = require("./controllers/PostController");
const followController = require("./controllers/FollowController");

// User related routes
router.get("/", userController.home);
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", userController.logout);

// Profile related routes
router.get(
  "/profile/:username",
  userController.ifUserExists,
  userController.profilePostsScreen
);

// Post related routes
router.get(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.viewCreateScreen
);
router.post(
  "/create-post",
  userController.mustBeLoggedIn,
  postController.storePost
);
router.get("/post/:id", postController.viewSinglePost);
router.get(
  "/post/:id/edit",
  userController.mustBeLoggedIn,
  postController.viewEditScreen
);
router.post(
  "/post/:id/edit",
  userController.mustBeLoggedIn,
  postController.updatePost
);
router.post(
  "/post/:id/delete",
  userController.mustBeLoggedIn,
  postController.deletePost
);
router.post("/search", postController.search);

// Follow related routes
router.post(
  "/addFollow/:username",
  userController.mustBeLoggedIn,
  followController.addFollow
);

module.exports = router;
