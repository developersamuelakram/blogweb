const mongoose = require("mongoose");
const schema = mongoose.Schema;
const userschema = new schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});
module.exports = mongoose.model("user", userschema);
