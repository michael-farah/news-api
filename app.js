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
app.get("/api/articles", articles.getArticles);
app.get("/api/articles/:article_id", articles.getArticle);

app.get("/api/articles/:article_id/comments", comments.getComments);
errorHandler(app);

module.exports = app;