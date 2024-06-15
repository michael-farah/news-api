const {
  fetchCommentsByArticleId,
  addComment,
  removeCommentById,
} = require("../models/comments");

exports.getCommentsByArticleId = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const comments = await fetchCommentsByArticleId(article_id);
    res.status(200).send(comments);
  } catch (err) {
    next(err);
  }
};

exports.postCommentByArticleId = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const { username, body } = req.body;
    const comment = await addComment(article_id, username, body);
    res.status(201).send(comment);
  } catch (err) {
    next(err);
  }
};

exports.deleteCommentById = async (req, res, next) => {
  try {
    const { comment_id } = req.params;
    await removeCommentById(comment_id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
