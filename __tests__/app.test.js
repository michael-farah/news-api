const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const data = require("../db/data/test-data/index");
const seed = require("../db/seeds/seed");
const utils = require("../db/seeds/utils");
const assertInternalServerError = utils.createAssertInternalServerError(
  db,
  app,
  request,
);

beforeEach(() => seed(data)); // Seed the database with the test data

afterAll(() => db.end()); // Close the database connection

describe("Error handling for unknown routes", () => {
  test("404: Path not found", async () => {
    const response = await request(app).get("/api/unknown").expect(404);
    expect(response.body.msg).toBe("Path not found");
  });
});

describe("GET /api", () => {
  const endpoints = require("../endpoints.json");

  test("200: Returns all available endpoints", async () => {
    const response = await request(app).get("/api").expect(200);
    expect(response.body).toEqual(endpoints);
  });
});

describe("GET /api/articles", () => {
  test("200: Returns all articles with the correct format and length", async () => {
    const { body: response } = await request(app)
      .get("/api/articles")
      .expect(200);
    expect(response).toHaveLength(13);
    expect(Array.isArray(response)).toBe(true);
    response.forEach((article) => {
      expect(article).toMatchObject({
        article_id: expect.any(Number),
        author: expect.any(String),
        title: expect.any(String),
        topic: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        article_img_url: expect.any(String),
        comment_count: expect.any(Number),
      });
      expect(article).not.toHaveProperty("body");
    });
  });
  test("200: Returns articles sorted by date in descending order", async () => {
    const { body: response } = await request(app)
      .get("/api/articles")
      .expect(200);
    expect(response).toBeSortedBy("created_at", { descending: true });
  });

  test("200: Returns expected article data", async () => {
    const { body: response } = await request(app)
      .get("/api/articles")
      .expect(200);
    expect(response[0]).toEqual({
      article_id: 3,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      author: "icellusedkars",
      comment_count: 2,
      created_at: "2020-11-03T09:12:00.000Z",
      title: "Eight pug gifs that remind me of mitch",
      topic: "mitch",
      votes: 0,
    });

    expect(response[12]).toEqual({
      article_id: 7,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      author: "icellusedkars",
      comment_count: 0,
      created_at: "2020-01-07T14:08:00.000Z",
      title: "Z",
      topic: "mitch",
      votes: 0,
    });
  });

  test("200: Returns articles filtered by topic", async () => {
    const { body: response } = await request(app)
      .get("/api/articles?topic=mitch")
      .expect(200);
    expect(response).toHaveLength(12);
  });
  describe("Error handling for GET /api/articles", () => {
    test("500: Internal Server Error", async () => {
      await assertInternalServerError("/api/articles", "Internal Server Error");
    });

    test("400: Bad request, invalid sort_by", async () => {
      const response = await request(app)
        .get("/api/articles?sort_by=invalid")
        .expect(400);
      expect(response.body.msg).toBe("Invalid sort_by value: invalid");
    });
    test("400: Bad request, invalid order", async () => {
      const response = await request(app)
        .get("/api/articles?order=invalid")
        .expect(400);
      expect(response.body.msg).toBe("Invalid order value: invalid");
    });

    test("400: Bad request, invalid order and sort_by", async () => {
      const response = await request(app)
        .get("/api/articles?order=invalid&sort_by=invalid")
        .expect(400);
      expect(response.body.msg).toBe(
        "Invalid sort_by value: invalid and Invalid order value: invalid",
      );
    });
  });
});

describe("GET /api/topics", () => {
  test("200: Return all topics", async () => {
    const response = await request(app).get("/api/topics").expect(200);
    expect(response.body.topics).toHaveLength(3);
  });

  describe("Error Handling for GET /api/topics", () => {
    test("200: Return expected topic data", async () => {
      const response = await request(app).get("/api/topics").expect(200);
      const expectedTopics = [
        { slug: "mitch", description: "The man, the Mitch, the legend" },
        { slug: "cats", description: "Not dogs" },
        { slug: "paper", description: "what books are made of" },
      ];
      expect(response.body.topics).toEqual(
        expect.arrayContaining(expectedTopics),
      );
    });

    test("500: Internal Server Error", async () => {
      await assertInternalServerError("/api/topics", "Internal Server Error");
    });
  });
});

describe("GET /api/articles/:articleId", () => {
  const getArticleById = async (articleId) => {
    const response = await request(app)
      .get(`/api/articles/${articleId}`)
      .expect(200);
    return response.body;
  };

  const getExpectedArticleData = (articleId) => {
    const article = data.articleData[articleId - 1];
    const createdAt = new Date(article.created_at);
    // The article with id 1 and 2 have a timezone offset of -1 hour due to BST.
    if (articleId !== 3) {
      createdAt.setHours(createdAt.getHours() - 1);
    }
    const expectedCreatedAt = createdAt.toISOString();

    return {
      article_id: articleId,
      title: article.title,
      topic: article.topic,
      author: article.author,
      body: article.body,
      created_at: expectedCreatedAt,
      votes: article.votes || 0,
      article_img_url: article.article_img_url,
    };
  };

  const testCases = [
    { articleId: 1, description: "returns article with id 1" },
    { articleId: 2, description: "returns article with id 2" },
    { articleId: 3, description: "returns article with id 3" },
  ];

  testCases.forEach(({ articleId, description }) => {
    test(description, async () => {
      const article = await getArticleById(articleId);
      expect(article).toEqual(getExpectedArticleData(articleId));
    });
  });

  describe("Error Handling for GET /api/articles/:article_id", () => {
    test("400: Bad request with invalid article id", async () => {
      const article_id = "invalid";
      const response = await request(app)
        .get(`/api/articles/${article_id}`)
        .expect(400);
      expect(response.body.msg).toBe("Bad request");
    });

    test("404: Article not found", async () => {
      const article_id = 1337;
      const response = await request(app)
        .get(`/api/articles/${article_id}`)
        .expect(404);
      expect(response.body.msg).toBe("Article not found");
    });

    test("500: Internal Server Error", async () => {
      await assertInternalServerError(
        "/api/articles/1",
        "Internal Server Error",
      );
    });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Return all comments for an article", async () => {
    const response = await request(app)
      .get("/api/articles/1/comments")
      .expect(200);
    expect(response.body).toHaveLength(11);
  });

  test("200: Return expected comment data", async () => {
    const response = await request(app)
      .get("/api/articles/1/comments")
      .expect(200);
    expect(response.body).toBeSortedBy("created_at", { descending: true });
    response.body.forEach((comment) => {
      expect(comment).toMatchObject({
        comment_id: expect.any(Number),
        votes: expect.any(Number),
        created_at: expect.any(String),
        author: expect.any(String),
        body: expect.any(String),
        article_id: expect.any(Number),
      });
    });
  });
  describe("Error Handling for GET /api/articles/:article_id/comments", () => {
    test("500: Internal Server Error", async () => {
      await assertInternalServerError(
        "/api/articles/1/comments",
        "Internal Server Error",
      );
    });

    test("400: Bad request, invalid article_id", async () => {
      const response = await request(app)
        .get("/api/articles/invalid/comments")
        .expect(400);
      expect(response.body.msg).toBe("Bad request");
    });

    test("404: Not found, article_id does not exist", async () => {
      const response = await request(app)
        .get("/api/articles/1337/comments")
        .expect(404);
      expect(response.body.msg).toBe("Article not found");
    });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  const validComment = {
    username: "butter_bridge",
    body: "This is a test comment",
  };

  test("201: Should create a new comment with the provided username and body", async () => {
    const response = await request(app)
      .post("/api/articles/1/comments")
      .send(validComment)
      .expect(201);

    expect(response.body).toEqual({
      article_id: 1,
      author: "butter_bridge",
      body: "This is a test comment",
    });
  });

  describe("Error Handling for POST /api/articles/:article_id/comments", () => {
    test("400: Bad request, invalid article_id", async () => {
      const response = await request(app)
        .post("/api/articles/invalid/comments")
        .send(validComment)
        .expect(400);

      expect(response.body.msg).toBe("Bad request");
    });

    test("400: Row not found, article_id does not exist", async () => {
      const response = await request(app)
        .post("/api/articles/1337/comments")
        .send(validComment)
        .expect(400);

      expect(response.body.msg).toBe("Row not found");
    });

    test("400: Invalid request, missing username", async () => {
      const invalidComment = {
        body: "This is a test comment",
      };
      const response = await request(app)
        .post("/api/articles/1/comments")
        .send(invalidComment)
        .expect(400);

      expect(response.body.msg).toBe("Invalid request");
    });
  });
});
describe("PATCH /api/articles/:article_id", () => {
  const validArticleId = 1;
  const validIncrement = 100;
  const invalidArticleId = "invalid";
  const invalidIncrement = "invalid";

  test("200: Should update an article by article_id", async () => {
    const originalResponse = await request(app).get(
      `/api/articles/${validArticleId}`,
    );
    const originalVotes = originalResponse.body.votes;
    const response = await request(app)
      .patch(`/api/articles/${validArticleId}`)
      .send({ inc_votes: validIncrement })
      .expect(200);
    expect(response.body).toMatchObject({
      author: "butter_bridge",
      title: "Living in the shadow of a great man",
      topic: "mitch",
      body: "I find this existence challenging",
      created_at: expect.any(String),
      article_id: validArticleId,
      votes: originalVotes + validIncrement,
    });
  });
  describe("Error Handling for PATCH /api/articles/:article_id", () => {
    test("404: Not found, article_id does not exist", async () => {
      const response = await request(app)
        .patch(`/api/articles/1337`)
        .send({ inc_votes: validIncrement })
        .expect(404);
      expect(response.body.msg).toBe("Article not found");
    });
    test("400: Bad request, invalid article_id", async () => {
      const response = await request(app)
        .patch(`/api/articles/${invalidArticleId}`)
        .send({ inc_votes: validIncrement })
        .expect(400);
      expect(response.body.msg).toBe("Bad request");
    });

    test("400: Invalid request, missing inc_votes", async () => {
      const response = await request(app)
        .patch(`/api/articles/${validArticleId}`)
        .send({})
        .expect(400);
      expect(response.body.msg).toBe("Invalid request");
    });

    test("400: Bad request, invalid inc_votes", async () => {
      const response = await request(app)
        .patch(`/api/articles/${validArticleId}`)
        .send({ inc_votes: invalidIncrement })
        .expect(400);
      expect(response.body.msg).toBe("Bad request");
    });
    
    test("500: Internal Server Error", async () => {
      await assertInternalServerError(
        `/api/articles/${validArticleId}`,
        "Internal Server Error",
        "patch",
        "{ inc_votes: validIncrement }",
      );
    });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: Should delete a comment by comment_id", async () => {
    const response = await request(app).delete("/api/comments/1").expect(204);
    expect(response.body).toEqual({});
  });
  describe("Error Handling for DELETE /api/comments/:comment_id", () => {
    test("400: Bad request, invalid comment_id", async () => {
      const response = await request(app)
        .delete("/api/comments/invalid")
        .expect(400);
      expect(response.body.msg).toBe("Bad request");
    });

    test("404: Not found, comment_id does not exist", async () => {
      const response = await request(app)
        .delete("/api/comments/1337")
        .expect(404);
      expect(response.body.msg).toBe("Comment not found");
    });

    test("500: Internal Server Error", async () => {
      await assertInternalServerError(
        "/api/comments/1",
        "Internal Server Error",
        "delete",
      );
    });
  });
});

describe("GET /api/users", () => {
  const expectedUsers = data.userData;

  test("200: Return all users", async () => {
    const { body: users } = await request(app).get("/api/users").expect(200);
    expect(users).toHaveLength(expectedUsers.length);
    users.forEach((user, index) => {
      expect(user).toMatchObject(expectedUsers[index]);
    });
  });
  describe("Error Handling for GET /api/users", () => {
    test("500: Internal Server Error", async () => {
      await assertInternalServerError(
        "/api/users",
        "Internal Server Error",
        "get",
      );
    });
  });
});