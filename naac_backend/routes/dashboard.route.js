const Router = require("express").Router();
const {
  getDashboardMetrics,
  updateCriterionScore,
} = require("../controller/dashboard.controller");

Router.get("/metrics", getDashboardMetrics);
Router.put("/criteria/:id", updateCriterionScore);

module.exports = Router;
