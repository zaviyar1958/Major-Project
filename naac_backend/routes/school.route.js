const Router = require("express").Router();
const {
  getAllSchools,
  createSchool,
  updateSchool,
  deleteSchool,
} = require("../controller/school.controller");

Router.get("/", getAllSchools);
Router.post("/", createSchool);
Router.put("/:id", updateSchool);
Router.delete("/:id", deleteSchool);

module.exports = Router;
