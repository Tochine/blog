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
    let post = await Post.findSinglePostById(req.params.id, req.visitorId);
    res.render("single-post-screen", { post: post });
  } catch {
    res.render("404");
  }
};

exports.viewEditScreen = async function (req, res) {
  try {
    let post = await Post.findSinglePostById(req.params.id);
    if (post.authorId == req.visitorId) {
      res.render("edit-post", { post: post });
    } else {
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(() => res.redirect("/"));
    }
  } catch {
    res.render("404");
  }
};

exports.updatePost = function (req, res) {
  let post = new Post(req.body, req.visitorId, req.params.id);
  post
    .update()
    .then((status) => {
      // The post was successfully updated to the database
      // Or user did have permission but there was validation errors
      if (status == "success") {
        // post was updated in db
        req.flash("success", "Post successfully updated.");
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      } else {
        post.errors.forEach(function (error) {
          req.flash("errors", error);
        });
        req.session.save(function () {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      }
    })
    .catch(() => {
      // A post with the requested id doesn't exist
      // Or if the current visitor is not the owner of the requested
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(function () {
        res.redirect("/");
      });
    });
};
