const { globalVariables } = require("./config/configuration");

const { response } = require("express");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const hbs = require("express-handlebars");
const { mongoDbUrl, PORT } = require("./config/configuration");
const flash = require("connect-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const fileUpload = require("express-fileupload");
const passport = require("passport");
const app = express();


// connect with mongoose

mongoose
  .connect(mongoDbUrl, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then((response) => {
    console.log("Mongo Db Connected Sucessfully");
  })
  .catch((err) => {
    console.log("Db connection failed");
  });

// Configure Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// flash and sessions

app.use(
  session({
    secret: "anysecret",
    saveUninitialized: true,
    resave: true,
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use(globalVariables);
app.use(fileUpload());

// setup view engine to use handlebars
app.engine("handlebars", hbs({ defaultLayout: "default" }));
app.set("view engine", "handlebars");

// Method override middleware
app.use(methodOverride("newMethod"));

// Routes
const defaultroute = require("./routes/defaultroute");
const adminroute = require("./routes/adminroute");

app.use("/", defaultroute);
app.use("/admin", adminroute);

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
