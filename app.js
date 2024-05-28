const express = require("express");
const errorHandler = require("./Errors/errorHandler");
const { articles, topics, comments, users } = require("./controllers/index");
const app = express();

app.get("/api/topics", topics.getTopics);

errorHandler(app);

module.exports = app;
