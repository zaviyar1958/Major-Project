const { Register, Login } = require("../controller/user.controller");

const Router = require("express").Router();

Router.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

Router.post("/register", Register);
Router.post("/login", Login);

module.exports = Router;