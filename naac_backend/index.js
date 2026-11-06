const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");

const swaggerMiddleware = require("./middleware/swaggerMiddleware");

dotenv.config();

const mainRoutes = require("./routes/main.route");

const { PORT } = process.env;

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  })
);

// // Serve static files (images) from the 'uploads' folder
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Setup Swagger UI with custom middleware
swaggerMiddleware(app);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "MMCH Backend API",
    swagger: "/api-docs",
    health: "/health",
  });
});
 

// Routes
app.use("/api", mainRoutes);

const port = PORT || 5000;

app.listen(port, () => {
  console.log(`swagger is running on http://localhost:${port}/api-docs`);
  console.log(`app is running on http://localhost:${port} `);
});