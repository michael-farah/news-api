const {
  fetchArticle,
  fetchArticles,
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