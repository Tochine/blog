const apiRouter = require("express").Router();

const userController = require("../controllers/UserController");
const postController = require("../controllers/PostController");
const followController = require("../controllers/FollowController");

const cors = require("cors");
// Will configure the routes to CORS policy
apiRouter.use(cors());

apiRouter.post("/login", userController.apiLogin);
apiRouter.post(
  "/create-post",
  userController.apiMustBeLoggedIn,
  postController.apiCreate
);
apiRouter.delete(
  "/post/:id",
  userController.apiMustBeLoggedIn,
  postController.apiDeletePost
);

apiRouter.get("/postsByAuthor/:username", userController.apiGetPostsByUsername);

module.exports = apiRouter;
