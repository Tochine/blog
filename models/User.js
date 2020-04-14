const usersCollection = require("../db").collection("users");
const validator = require("validator");

let User = function (data) {
  this.data = data;
  this.errors = [];
};

User.prototype.cleanUp = function () {
  if (typeof this.data.username != "string") {
    this.data.username = "";
  }
  if (typeof this.data.email != "string") {
    this.data.email = "";
  }
  if (typeof this.data.password != "string") {
    this.data.password = "";
  }

  // Getting rid of any bogus property
  this.data = {
    username: this.data.username.trim().toLowerCase(),
    email: this.data.email.trim().toLowerCase(),
    password: this.data.password,
  };
};

User.prototype.validate = function () {
  if (this.data.username == "") {
    this.errors.push("You must provide a username");
  }
  if (
    this.data.username != "" &&
    !validator.isAlphanumeric(this.data.username)
  ) {
    this.errors.push("Username can only contain letters and numbers.");
  }
  if (!validator.isEmail(this.data.email)) {
    this.errors.push("You must provide a valid email address");
  }
  if (this.data.password == "") {
    this.errors.push("You must provide a password");
  }
  if (this.data.password.lenth > 0 && this.data.password.lenth < 5) {
    this.errors.push("Password must be at least 5 characters");
  }
  if (this.data.password.lenth > 100) {
    this.errors.push("Password cannot exceed 100 characters.");
  }
  if (this.data.username.lenth > 0 && this.data.username.lenth < 5) {
    this.errors.push("Username must be at least 5 characters");
  }
  if (this.data.username.lenth > 100) {
    this.errors.push("Username cannot exceed 100 characters.");
  }
};

User.prototype.register = function () {
  // Step #1: validate user data
  this.cleanUp();
  this.validate();
  // Step #2: Only if there are no error
  // Then save the user data to a database
  if (!this.errors.length) {
    usersCollection.insertOne(this.data);
  }
};

module.exports = User;
