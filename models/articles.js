const db = require("../db/connection");
const { validateQueries } = require("../db/seeds/utils");

exports.fetchArticleById = async (article_id) => {
  const queryStr = `
  SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.body, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.comment_id) AS comment_count
  FROM articles
  LEFT JOIN comments ON articles.article_id = comments.article_id
  WHERE articles.article_id = $1
  GROUP BY articles.article_id;
  `;
  if (isNaN(article_id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request: Article ID must be a number.",
    });
  }

  const { rows } = await db.query(queryStr, [article_id]);
  if (rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Article not found." });
  }
  return rows[0];
};

exports.fetchArticles = async (
  sort_by = "created_at",
  order = "desc",
  topic = null,
) => {
  await validateQueries(sort_by, order, topic);

  const queryStr = `
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
    ${topic ? `WHERE articles.topic = $1` : ""}
    GROUP BY articles.article_id
    ORDER BY ${sort_by} ${order}`;

  const { rows } = topic
    ? await db.query(queryStr, [topic])
    : await db.query(queryStr);
  return rows;
};

exports.updateArticleVotes = async (article_id, inc_votes) => {
  if (isNaN(article_id)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request: Article ID must be a number.",
    });
  } else if (isNaN(inc_votes)) {
    return Promise.reject({
      status: 400,
      msg: "Bad Request: Vote increment must be a number.",
    });
  }

  const queryStr = `
    UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;
  `;

  const { rows } = await db.query(queryStr, [inc_votes, article_id]);
  if (rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Article not found." });
  }

  return rows[0];
};