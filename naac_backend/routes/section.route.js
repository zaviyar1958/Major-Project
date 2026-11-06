const Router = require("express").Router();
const {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
} = require("../controller/section.controller");

Router.get("/", getAllSections);
Router.post("/", createSection);
Router.put("/:id", updateSection);
Router.delete("/:id", deleteSection);

module.exports = Router;
