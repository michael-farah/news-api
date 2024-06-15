const express = require("express");
const app = express();
const controller = require("./controllers/index");
const endpoints = require("./endpoints.json");
const errorHandler = require("./errorHandler");

app.use(express.json());

app.get("/api", (req, res) => {
  res.status(200).send(endpoints);
});

app.get("/api/articles", controller.getArticles);
app.get("/api/articles/:article_id", controller.getArticleById);
app.patch("/api/articles/:article_id", controller.patchArticleById);
app.get(
  "/api/articles/:article_id/comments",
  controller.getCommentsByArticleId,
);
app.post(
  "/api/articles/:article_id/comments",
  controller.postCommentByArticleId,
);
app.get("/api/topics", controller.getTopics);
app.get("/api/users", controller.getUsers);
app.delete("/api/comments/:comment_id", controller.deleteCommentById);


app.all("/*", (req, res) => {
  res.status(404).send({ msg: "Path not found." });
});
app.use(errorHandler);


module.exports = app;