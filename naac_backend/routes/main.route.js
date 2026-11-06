const Router = require("express").Router();
const httpstatusConstant = require("../constant/httpstatus.constant");
const authRoutes = require("./auth.route");
const facultyRoutes = require("./faculty.route");
const dashboardRoutes = require("./dashboard.route");
const schoolRoutes = require("./school.route");
const departmentRoutes = require("./department.route");
const sectionRoutes = require("./section.route");
const programRoutes = require("./program.route");
const courseRoutes = require("./course.route");
const criterionRoutes = require("./criterion.route");

Router.get("/health", (req, res) => {
  return res.status(httpstatusConstant.OK).json({
    success: true,
    message: "Health check successful",
    timestamp: new Date().toISOString(),
  });
});

Router.use("/auth", authRoutes);
Router.use("/faculty", facultyRoutes);
Router.use("/dashboard", dashboardRoutes);
Router.use("/schools", schoolRoutes);
Router.use("/departments", departmentRoutes);
Router.use("/sections", sectionRoutes);
Router.use("/programs", programRoutes);
Router.use("/courses", courseRoutes);
Router.use("/criterion", criterionRoutes);

module.exports = Router;
