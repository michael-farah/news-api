const db = require("../connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createRef = (arr, key, value) => {
  return arr.reduce((ref, element) => {
    ref[element[key]] = element[value];
    return ref;
  }, {});
};

exports.formatComments = (comments, idLookup) => {
  return comments.map(({ created_by, belongs_to, ...restOfComment }) => {
    const article_id = idLookup[belongs_to];
    return {
      article_id,
      author: created_by,
      ...this.convertTimestampToDate(restOfComment),
    };
  });
};

const getValidTopics = async () => {
  const query = "SELECT slug FROM topics";
  const { rows } = await db.query(query);
  return rows.map((row) => row.slug);
};

exports.validateQueries = async (sort_by, order, topic) => {
  const validSortBy = [
    "created_at",
    "author",
    "title",
    "topic",
    "votes",
    "comment_count",
  ];
  const validOrder = ["asc", "desc"];
  const validTopics = await getValidTopics();

  const errorMessages = [
    !validSortBy.includes(sort_by) && `Invalid sort_by value: ${sort_by}`,
    !validOrder.includes(order) && `Invalid order value: ${order}`,
    topic && !validTopics.includes(topic) && `Invalid topic value: ${topic}`,
  ].filter(Boolean);

  if (errorMessages.length > 0) {
    return Promise.reject({ status: 400, msg: errorMessages.join(" and ") });
  }
};

exports.assertInternalServerError = async (
  path,
  expectedMsg,
  method = "get",
  body,
) => {
  const app = require("../../app");
  const request = require("supertest");
  const db = require("../connection");

  const mockQuery = jest
    .spyOn(db, "query")
    .mockRejectedValueOnce(new Error("Database error"));

  let response;
  switch (method.toLowerCase()) {
    case "post":
      response = await request(app).post(path).send(body).expect(500);
      break;
    case "patch":
      response = await request(app).patch(path).send(body).expect(500);
      break;
    case "delete":
      response = await request(app).delete(path).expect(500);
      break;
    default:
      response = await request(app).get(path).expect(500);
      break;
  }

  expect(response.status).toBe(500);
  expect(response.body.msg).toEqual(expectedMsg);
  mockQuery.mockRestore();
};

exports.expectedArticle = async (article_id) => {
  const app = require("../../app");
  const request = require("supertest");

  const { body: articles } = await request(app)
    .get("/api/articles")
    .expect(200);
  const articleData = articles.find(
    (article) => article.article_id === article_id,
  );
  const { created_at } = articleData;

  const commentCount = await getCommentCount(article_id);

  return {
    article_id,
    author: articleData.author,
    body: expect.any(String),
    title: articleData.title,
    topic: articleData.topic,
    created_at,
    votes: articleData.votes,
    article_img_url: articleData.article_img_url,
    comment_count: commentCount,
  };
};

const getCommentCount = async (article_id) => {
  const queryStr = `
    SELECT COUNT(*) AS comment_count
    FROM comments
    WHERE article_id = $1;
  `;

  const { rows } = await db.query(queryStr, [article_id]);
  return rows[0].comment_count;
};
