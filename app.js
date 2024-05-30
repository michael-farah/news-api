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
app.use(express.json());

app.get("/api", api.getEndpoints);
app.get("/api/topics", topics.getTopics);
app.get("/api/articles", articles.getArticles);
app.get("/api/articles/:article_id", articles.getArticle);
app.patch("/api/articles/:article_id", articles.patchArticle);

app.get("/api/articles/:article_id/comments", comments.getComments);
app.post("/api/articles/:article_id/comments", comments.postComment);

errorHandler(app);

module.exports = app;