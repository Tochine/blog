const Post = require("../models/Post");

exports.viewCreateScreen = function (req, res) {
  res.render("create-post");
};
exports.storePost = function (req, res) {
  let post = new Post(req.body, req.session.user._id);
  post
    .store()
    .then(function () {
      res.send("New post created.");
    })
    .catch(function (errors) {
      res.send(errors);
    });
};

exports.viewSinglePost = async function (req, res) {
  try {
    let post = await Post.findSinglePostById(req.params.id);
    res.render("single-post-screen", { post: post });
  } catch {
    res.render("404");
  }
};
