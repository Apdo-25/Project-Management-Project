require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const path = require("path");
const corsOptions = require("./config/cors");
const connectDB = require("./config/database");
const credentials = require("./middleware/credentials");
const errorHandlerMiddleware = require("./middleware/error_handler");
const authenticationMiddleware = require("./middleware/authentication");

const app = express();
const PORT = 4000;

// Connect to DB
connectDB();

//swagger deps
const swaggerUi = require("swagger-ui-express");
const yaml = require("yamljs");

//swagger setup
const swaggerDefinition = yaml.load("./swagger.yaml");
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

//CORS;
app.use(cors);

// middleware for credentials
app.use(credentials);

// application.x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// application/json response
app.use(express.json());

// middleware for cookies
app.use(cookieParser());

// authentication middleware
app.use(authenticationMiddleware);

//static files
app.use("/static", express.static(path.join(__dirname, "public")));

// Default error handler
app.use(errorHandlerMiddleware);

//root route
app.get("/", (req, res) => {
  res.status(200).send({ message: "Hello World!" });
});

// Routes
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/project", require("./routes/api/project"));
app.use("/api/task", require("./routes/api/task"));

// 404
app.all("*", (req, res) => {
  res.status(404);

  if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("text").send("404 Not Found");
  }
});

// Listen on port
mongoose.connection.once("open", () => {
  console.log("DB connected");
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
});

module.exports = app;
