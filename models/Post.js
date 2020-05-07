const postsCollection = require("../db").db().collection("posts");
const objectID = require("mongodb").ObjectID;
const User = require("./User");

let Post = function (data, userId) {
  this.data = data;
  this.errors = [];
  this.userId = userId;
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title != "string") {
    this.data.title = "";
  }
  if (typeof this.data.body != "string") {
    this.data.body = "";
  }

  // Get rid of any bogus properties
  this.data = {
    title: this.data.title.trim(),
    body: this.data.body.trim(),
    author: objectID(this.userId),
    createdDate: new Date(),
  };
};

Post.prototype.validate = function () {
  if (this.data.title == "") {
    this.errors.push("You must provide a title.");
  }
  if (this.data.body == "") {
    this.errors.push("You must provide post content.");
  }
};

Post.prototype.store = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
    // If the errors array is empty
    if (!this.errors.length) {
      // Save post to database
      postsCollection
        .insertOne(this.data)
        .then(() => {
          resolve();
        })
        .catch(() => {
          this.errors.push("Please try again later!");
          reject(this.errors);
        });
    } else {
      reject(this.errors);
    }
  });
};

Post.reusablePostQuery = function (uniqueOperations) {
  return new Promise(async function (resolve, reject) {
    let aggregateOperations = uniqueOperations.concat([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDocument",
        },
      },
      {
        $project: {
          title: 1,
          body: 1,
          createdDate: 1,
          author: { $arrayElemAt: ["$authorDocument", 0] },
        },
      },
    ]);

    let posts = await postsCollection.aggregate(aggregateOperations).toArray();

    // Clean up author property in each post object
    posts = posts.map(function (post) {
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar,
      };
      return post;
    });
    resolve(posts);
  });
};

Post.findSinglePostById = function (id) {
  return new Promise(async function (resolve, reject) {
    // If the ID is not a string of text or not a valid mongodb ID
    if (typeof id != "string" || !objectID.isValid(id)) {
      reject();
      return;
    }

    let posts = await Post.reusablePostQuery([
      { $match: { _id: new objectID(id) } },
    ]);

    if (posts.length) {
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

Post.findByAuthorId = function (authorId) {
  return Post.reusablePostQuery([
    { $match: { author: authorId } },
    { $sort: { createdDate: -1 } },
  ]);
};

module.exports = Post;
