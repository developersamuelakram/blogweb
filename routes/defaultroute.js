const postmodel = require("../models/postmodel");
const usermodel = require("../models/usersmodel.js");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const { route } = require("./adminroute");

router.all("/*", (req, res, next) => {
  req.app.locals.layout = "default";

  next();
});

// Defining Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passReqToCallback: true,
    },
    (req, email, password, done) => {
      usermodel.findOne({ email: email }).then((user) => {
        if (!user) {
          return done(
            null,
            false,
            req.flash("error-message", "User not found with this email.")
          );
        }

        bcrypt.compare(password, user.password, (err, passwordMatched) => {
          if (err) {
            return err;
          }

          if (!passwordMatched) {
            return done(
              null,
              false,
              req.flash("error-message", "Invalid Username or Password")
            );
          }

          return done(
            null,
            user,
            req.flash("success-message", "Login Successful")
          );
        });
      });
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  usermodel.findById(id, function (err, user) {
    done(err, user);
  });
});

//   homepage
router.get("/", async (req, res) => {
  const posts = await postmodel.find().lean();
  console.log(posts);
  res.render("default/index", { posts: posts });
});

// login get route
router.get("/login", (req, res) => {
  res.render("default/login");
});

// login entering route

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/login",
    failureFlash: true,
    successFlash: true,
    session: true,
  }),
  (req, res) => {
    res.render("/default/login");
  }
);

// register get route

router.get("/register", (req, res) => {
  res.render("default/register");
});

// registering the user

router.post("/register", async (req, res) => {
  let errors = [];

  if (!req.body.firstName) {
    errors.push({ message: "First name is mandatory" });
  }
  if (!req.body.lastName) {
    errors.push({ message: "Last name is mandatory" });
  }
  if (!req.body.email) {
    errors.push({ message: "Email field is mandatory" });
  }
  if (!req.body.password || !req.body.passwordConfirm) {
    errors.push({ message: "Password field is mandatory" });
  }
  if (req.body.password !== req.body.passwordConfirm) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("default/register", {
      errors: errors,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    });
  } else {
    await usermodel.findOne({ email: req.body.email }).then((user) => {
      if (user) {
        req.flash("error-message", "Email already exists, try to login.");
        res.redirect("/login");
      } else {
        const newuser = new usermodel(req.body);

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newuser.password, salt, (err, hash) => {
            newuser.password = hash;
            newuser.save().then((user) => {
              req.flash("success-message", "You are now registered");
              res.redirect("/login");
            });
          });
        });
      }
    });
  }
});

// single post page

router.get("/post/:id", async (req, res) => {
  const id = req.params.id;
  await postmodel
    .findById(id)
    .lean()
    .then((post) => {
      if (!post) {
        res.status(404).json({ message: "No Post Found" });
      } else {
        res.render("default/singlepost", { post: post });
      }
    });
});

// logout
router.get("/logout", async (req, res) => {
  await req.logOut();
  req.flash("success-message", "Logged Out");
  res.redirect("/");
});

// get json response
router.get("/json", async (req, res) => {
  await postmodel.find({}, (err, arrayofposts) => {
    if (!err) {
      res.json(arrayofposts);
    }
  });
});

module.exports = router;
