const Router = require("express").Router();
const {
  getSubmissions,
  saveSubmission,
} = require("../controller/criterion.controller");

Router.get("/submissions", getSubmissions);
Router.post("/save", saveSubmission);

module.exports = Router;
