const {
  fetchArticleById,
  fetchArticles,
  updateArticleVotes,
} = require("../models/articles");

exports.getArticleById = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const article = await fetchArticleById(article_id);
    res.status(200).send(article);
  } catch (err) {
    next(err);
  }
};

exports.getArticles = async (req, res, next) => {
  try {
    const { sort_by, order, topic } = req.query;
    const articles = await fetchArticles(sort_by, order, topic);
    res.status(200).send(articles);
  } catch (err) {
    next(err);
  }
};

exports.patchArticleById = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const { inc_votes } = req.body;
    const updatedArticle = await updateArticleVotes(article_id, inc_votes);
    res.status(200).send(updatedArticle);
  } catch (err) {
    next(err);
  }
};