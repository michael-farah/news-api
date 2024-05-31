const { fetchComments, addComment, removeComment } = require("../models/comments");

exports.getComments = async (req, res, next) => {
  const { article_id } = req.params;
  try {
    const comments = await fetchComments(article_id);
    res.status(200).send(comments);
  } catch (err) {
    next(err);
  }
};

exports.postComment = async (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  try {
    const comment = await addComment(article_id, username, body);
    res.status(201).send(comment);
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  const { comment_id } = req.params;
  try {
    await removeComment(comment_id);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
