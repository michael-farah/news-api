const {
  fetchArticle,
  fetchArticles,
  updateArticle,
} = require("../models/articles");

exports.getArticle = async (req, res, next) => {
  const { article_id } = req.params;
  try {
    const article = await fetchArticle(article_id);
    res.status(200).send(article);
  } catch (err) {
    next(err);
  }
};

exports.getArticles = async (req, res, next) => {
  const { sort_by, order } = req.query;
  try {
    const articles = await fetchArticles(sort_by, order);
    res.status(200).send(articles);
  } catch (err) {
    next(err);
  }
};

exports.patchArticle = async (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  try {
    const article = await updateArticle(article_id, inc_votes);
    res.status(200).send(article);
  } catch (err) {
    next(err);
  }
};