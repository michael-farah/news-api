const {
    fetchComments,
  } = require("../models/comments");

exports.getComments = async (req, res, next) => {
    const { article_id } = req.params;
    try {
      const comments = await fetchComments(article_id);
      res.status(200).send(comments);
    } catch (err) {
      next(err);
    }
  };