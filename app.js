const express = require("express");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger/swagger.json");

const testRoutes = require("./routes/test.route");
const userRoutes = require("./routes/user.route");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// The Swagger HTML uses relative asset URLs, so normalize the URL to a
// directory path before serving the UI. Vercel serves these assets from public/.
app.get("/api-docs", (req, res) => res.redirect(308, "/api-docs/"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/test", testRoutes);
app.use("/user", userRoutes);
module.exports = app;
