require('dotenv').config()

module.exports = {
  mongoDbUrl:
    "mongodb+srv://user1:" + process.env.PW+ "@cluster0.wno08.mongodb.net/" + process.env.DBNAME + "cmsweb?retryWrites=true&w=majority",
  PORT: process.env.PORT || 4000,
  globalVariables: (req, res, next) => {
    res.locals.success_message = req.flash("success-message");
    res.locals.error_message = req.flash("error-message");
    res.locals.user = req.user || null;
    next();
  },
};
