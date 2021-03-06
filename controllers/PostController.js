const Post = require("../models/Post");

exports.viewCreateScreen = function (req, res) {
  res.render("create-post");
};

exports.storePost = function (req, res) {
  let post = new Post(req.body, req.session.user._id);
  post
    .store()
    .then(function (newId) {
      req.flash("success", "New post successfully created.");
      req.session.save(() => res.redirect(`/post/${newId}`));
    })
    .catch(function (errors) {
      errors.forEach((error) => req.flash("errors", error));
      req.session.save(() => res.redirect("/create-post"));
    });
};

exports.viewSinglePost = async function (req, res) {
  try {
    let post = await Post.findSinglePostById(req.params.id, req.visitorId);
    res.render("single-post-screen", { post: post, title: post.title });
  } catch {
    res.render("404");
  }
};

exports.viewEditScreen = async function (req, res) {
  try {
    let post = await Post.findSinglePostById(req.params.id, req.visitorId);
    if (post.isVisitorOwner) {
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

exports.deletePost = function (req, res) {
  Post.delete(req.params.id, req.visitorId)
    .then(() => {
      req.flash("success", "Post successfully deleted.");
      req.session.save(() => {
        res.redirect(`/profile/${req.session.user.username}`);
      });
    })
    .catch(() => {
      req.flash("errors", "You do not have permission to perform that action.");
      req.session.save(() => res.redirect("/"));
    });
};

exports.search = function (req, res) {
  Post.search(req.body.searchTerm)
    .then((posts) => {
      res.json(posts);
    })
    .catch(() => {
      res.json([]);
    });
};

// Api related functions

exports.apiCreate = function (req, res) {
  let post = new Post(req.body, req.apiUser._id);
  post
    .store()
    .then(function (newId) {
      res.json("Congrats, post created!", 201);
    })
    .catch(function (errors) {
      res.json(errors);
    });
};

exports.apiDeletePost = function (req, res) {
  Post.delete(req.params.id, req.apiUser._id)
    .then(() => {
      res.status(200).json("Post successfully deleted.");
    })
    .catch(() => {
      res
        .status(401)
        .json("You do not have permission to perform that action.");
    });
};
