const express = require("express");
const errorHandler = require("./Errors/errorHandler");
const {
  articles,
  topics,
  comments,
  users,
  api,
} = require("./controllers/index");
const app = express();

app.get("/api", api.getEndpoints);
app.get("/api/topics", topics.getTopics);
app.get("/api/articles/:article_id", articles.getArticle);
errorHandler(app);

module.exports = app;