const Router = require("express").Router();
const {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controller/course.controller");

Router.get("/", getAllCourses);
Router.post("/", createCourse);
Router.put("/:id", updateCourse);
Router.delete("/:id", deleteCourse);

module.exports = Router;
