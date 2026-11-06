const Router = require("express").Router();
const {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} = require("../controller/program.controller");

Router.get("/", getAllPrograms);
Router.post("/", createProgram);
Router.put("/:id", updateProgram);
Router.delete("/:id", deleteProgram);

module.exports = Router;
