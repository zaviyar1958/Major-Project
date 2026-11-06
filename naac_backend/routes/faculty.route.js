const Router = require("express").Router();
const {
  getAllFaculty,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} = require("../controller/faculty.controller");

Router.get("/", getAllFaculty);
Router.post("/", createFaculty);
Router.put("/:id", updateFaculty);
Router.delete("/:id", deleteFaculty);

module.exports = Router;
