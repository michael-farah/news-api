const articles = require("./articles");
const topics = require("./topics");
const comments = require("./comments");
const users = require("./users");

module.exports = {
  getArticles: articles.getArticles,
  getArticleById: articles.getArticleById,
  patchArticleById: articles.patchArticleById,
  getCommentsByArticleId: comments.getCommentsByArticleId,
  postCommentByArticleId: comments.postCommentByArticleId,
  deleteCommentById: comments.deleteCommentById,
  getTopics: topics.getTopics,
  getUsers: users.getUsers,
};