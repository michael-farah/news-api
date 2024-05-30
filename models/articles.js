const db = require("../db/connection");
exports.fetchArticle = async (article_id) => {
  const {
    rows: [article],
  } = await db.query(`SELECT * FROM articles WHERE article_id=$1`, [
    article_id,
  ]);
  return article || Promise.reject({ status: 404, msg: "Article not found" });
};

exports.fetchArticles = async (sort_by = "created_at", order = "desc") => {
  const validSortBy = ["created_at", "author", "title", "topic", "votes"];
  const validOrder = ["asc", "desc"];

  if (!validSortBy.includes(sort_by) && !validOrder.includes(order)) {
    const err = new Error();
    err.status = 400;
    err.msg = "Invalid sort_by and order values";
    throw err;
  }

  if (!validSortBy.includes(sort_by)) {
    const err = new Error();
    err.status = 400;
    err.msg = `Invalid sort_by value: ${sort_by}`;
    throw err;
  }

  if (!validOrder.includes(order)) {
    const err = new Error();
    err.status = 400;
    err.msg = `Invalid order value: ${order}`;
    throw err;
  }

  const query = `
    SELECT 
      articles.article_id, 
      articles.author, 
      articles.title, 
      articles.topic, 
      articles.created_at, 
      articles.votes, 
      articles.article_img_url, 
      CAST(COUNT(comments.article_id) AS INTEGER) AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order}`;

  const { rows: articles } = await db.query(query);
  return articles;
};