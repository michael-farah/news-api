const db = require("../db/connection");
const utils = require("../db/seeds/utils");
exports.fetchArticle = async (article_id) => {
  const {
    rows: [article],
  } = await db.query(`SELECT * FROM articles WHERE article_id=$1`, [
    article_id,
  ]);
  return article || Promise.reject({ status: 404, msg: "Article not found" });
};

exports.fetchArticles = async (sort_by = "created_at", order = "desc") => {
  utils.validateSortAndOrder(sort_by, order);

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

exports.fetchComments = async (
  article_id,
  sort_by = "created_at",
  order = "desc",
) => {
  utils.validateSortAndOrder(sort_by, order);
  const query = `
    SELECT 
      comments.comment_id, 
      comments.votes, 
      comments.created_at, 
      comments.author, 
      comments.body, 
      comments.article_id
    FROM comments
    WHERE article_id = $1 
    ORDER BY ${sort_by} ${order}`;
  try {
    const { rows: comments } = await db.query(query, [article_id]);
    if (comments.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found" });
    }
    return comments.map((comment) => {
      return {
        comment_id: comment.comment_id,
        votes: comment.votes,
        created_at: comment.created_at,
        author: comment.author,
        body: comment.body,
        article_id: comment.article_id,
      };
    });
  } catch (err) {
    return Promise.reject(err);
  }
};