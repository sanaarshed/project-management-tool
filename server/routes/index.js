var express = require('express')
const userRoutes = require('./users')
const taskRouter = require("./tasks");
const projectRouter = require("./projects");
const teamRouter = require("./teams");
const tasklistRouter = require("./tasklists");
const commentRouter = require("./comments");
const userteamRouter = require("./userteams");
const fileRouter = require("./file");
const routes = express.Router()

routes.use(userRoutes)
routes.use("/task", taskRouter);
routes.use("/project", projectRouter);
routes.use("/team", teamRouter);
routes.use("/tasklist", tasklistRouter);
routes.use("/comment", commentRouter);
routes.use("/userteam", userteamRouter);
routes.use("/file", fileRouter);
module.exports = routes
