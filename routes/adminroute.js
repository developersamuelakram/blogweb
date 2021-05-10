const express = require("express");
const { isUserAuthenticated, isEmpty } = require("../config/customfunction");
const router = express.Router();
const postmodel = require("../models/postmodel");

// middlewear
router.all("/*", isUserAuthenticated, (req, res, next) => {
  req.app.locals.layout = "admin";
  next();
});

//   homepage of admin

router.get("/", (req, res) => {
  res.render("admin/index");
});

// all posts page

router.get("/posts", async (req, res) => {
  const posts = await postmodel.find().lean();

  res.render("admin/posts/index", { posts: posts });
});

// create post page (displaying that page)

router.get("/posts/create", (req, res) => {
  res.render("admin/posts/create");
});

// create post page (creating the post on that page and saving it)

router.post("/posts/create", async (req, res) => {
  // check for input files
  let filename = "";

  if (!isEmpty(req.files)) {
    let file = req.files.uploadedFile;
    filename = file.name;
    let uploadDir = "./public/uploads/";

    file.mv(uploadDir + filename, (err) => {
      if (err) throw err;
    });
  }
  const newpost = new postmodel({
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    file: `/uploads/${filename}`,
  });

  await newpost.save().then((post) => {
    console.log(post);
    req.flash("success-message", "Post Created Successfully");
    res.redirect("/admin/posts");
  });
});

// editing the post (displaying edit page)
router.get("/posts/edit/:id", async (req, res) => {
  const id = req.params.id;

  await postmodel
    .findById(id)
    .lean()
    .then((post) => {
      res.render("admin/posts/edit", { post: post });
    });
});

// submitting the update

router.post("/posts/edit/:id", async (req, res) => {
  const id = req.params.id;

  await postmodel.findById(id).then((post) => {
    post.title = req.body.title;
    post.status = req.body.status;
    post.description = req.body.description;

    post.save().then((updatePost) => {
      req.flash(
        "success-message",
        `The Post ${updatePost.title} has been updated.`
      );
      res.redirect("/admin/posts");
    });
  });
});

// delteing the post

router.delete("/posts/delete/:id", async (req, res) => {
  await postmodel.findByIdAndDelete(req.params.id).then((deletedPost) => {
    req.flash(
      "success-message",
      `The Post with ${deletedPost.title} has been deleted`
    );
    res.redirect("/admin/posts");
  });
});

module.exports = router;
