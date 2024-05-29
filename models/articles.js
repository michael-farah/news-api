const db = require("../db/connection");
exports.fetchArticle = async (article_id) => {
  const {
    rows: [article],
  } = await db.query(`SELECT * FROM articles WHERE article_id=$1`, [
    article_id,
  ]);
  return article
  ? article
  : Promise.reject({ status: 404, msg: "Article not found" });
};