const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");
const markdown = require("marked");
const csrf = require("csurf");
const app = express();
const sanitizeHTML = require("sanitize-html");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/v1", require("./route/router-api"));

let sessionOptions = session({
  secret: "Progressiong fine with my JavaScript classes",
  store: new MongoStore({ client: require("./db") }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  },
});

app.use(sessionOptions);
app.use(flash());

app.use(function (req, res, next) {
  // Make our markdown function available from within ejs template
  res.locals.filterUserHTML = function (content) {
    return sanitizeHTML(markdown(content), {
      allowedTags: [
        "p",
        "i",
        "li",
        "ol",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "a",
        "ul",
        "strong",
        "bold",
        "em",
        "br",
      ],
      allowedAttributes: {},
    });
  };

  // Make all errors and success flash messages available from all templates
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");

  // Make current user id available on the req object
  if (req.session.user) {
    req.visitorId = req.session.user._id;
  } else {
    req.visitorId = 0;
  }
  // Make user session data available from within pages templates
  res.locals.user = req.session.user;
  next();
});

const router = require("./route/router");

app.use(express.static("public"));
app.set("views", "pages");
app.set("view engine", "ejs");

app.use(csrf());

app.use(function (req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use("/", router);

app.use(function (err, req, res, next) {
  if (err) {
    if (err.code == "EBADCSRFTOKEN") {
      req.flash("errors", "Cross Site Request Forgery detected");
      req.session.save(() => res.redirect("/"));
    } else {
      res.render("404");
    }
  }
});

const server = require("http").createServer(app);

const socketIO = require("socket.io")(server);

socketIO.use(function (socket, next) {
  sessionOptions(socket.request, socket.request.res, next);
});

socketIO.on("connection", function (socket) {
  if (socket.request.session.user) {
    let user = socket.request.session.user;

    socket.emit("welcome", { username: user.username, avatar: user.avatar });

    socket.on("chatMessageFromBrowser", function (data) {
      socket.broadcast.emit("chatMessageFromBrowser", {
        message: sanitizeHTML(data.message, {
          allowedTags: [],
          allowedAttributes: {},
        }),
        username: user.username,
        avatar: user.avatar,
      });
    });
  }
});

module.exports = server;
