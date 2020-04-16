const User = require("../models/User");

exports.register = function (req, res) {
  let user = new User(req.body);
  user
    .register()
    .then(() => {
      req.q.session.user = { username: this.data.username };
      req.session.save(function () {
        res.redirect("/");
      });
    })
    .catch((registrationErrors) => {
      registrationErrors.forEach((error) => {
        req.flash("registrationErrors", error);
      });
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.login = function (req, res) {
  let user = new User(req.body);
  user
    .login()
    .then(function (result) {
      req.session.user = { favColor: "blue", username: user.data.username };
      req.session.save(function () {
        res.redirect("/");
      });
    })
    .catch(function (err) {
      req.flash("errors", err);
      req.session.save(function () {
        res.redirect("/");
      });
    });
};

exports.logout = function (req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

exports.home = function (req, res) {
  if (req.session.user) {
    res.render("home-dashboard", { username: req.session.user.username });
  } else {
    res.render("home-guest", {
      errors: req.flash("errors"),
      regErrors: req.flash("registrationErrors"),
    });
  }
};
