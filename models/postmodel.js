const mongoose = require("mongoose");
const createdompurify = require("dompurify");
const marked = require("marked");

const { JSDOM } = require("jsdom");
const dompurify = createdompurify(new JSDOM().window);

const schema = mongoose.Schema;

const postschema = new schema({
  title: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: "public",
  },
  description: {
    type: String,
    required: true,
  },
  creationDate: {
    type: Date,
    default: Date.now(),
  },

  user: {
    type: schema.Types.ObjectId,
    ref: "user",
  },

  file: {
    type: String,
    default: "",
  },

  sanitizedHtml: {
    type: String,
    required: true,
  },
});

// we will run this validation everytime we CURD
postschema.pre("validate", function (next) {
  if (this.description) {
    // it converts our markdown to html
    // purifies that html to get rid of malicious code and escapes all html characters

    this.sanitizedHtml = dompurify.sanitize(marked(this.description));
  }

  next();
});

console.log("");

module.exports = mongoose.model("post", postschema);
