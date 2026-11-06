const Router = require("express").Router();
const {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controller/department.controller");

Router.get("/", getAllDepartments);
Router.post("/", createDepartment);
Router.put("/:id", updateDepartment);
Router.delete("/:id", deleteDepartment);

module.exports = Router;
