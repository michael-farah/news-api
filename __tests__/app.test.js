const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const data = require("../db/data/test-data/index");
const seed = require("../db/seeds/seed");
const utils = require("../db/seeds/utils");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("API Endpoints", () => {
  describe("Error handling for unknown routes", () => {
    it("should return 404 for unknown paths", async () => {
      const {
        body: { msg },
      } = (body = await request(app).get("/api/unknown").expect(404));
      expect(msg).toBe("Path not found.");
    });
  });

  describe("GET /api", () => {
    const endpoints = require("../endpoints.json");

    it("should return 200 with all available endpoints", async () => {
      const { body } = await request(app).get("/api").expect(200);
      expect(body).toEqual(endpoints);
    });
  });

  describe("GET /api/articles", () => {
    it("should return 200 with all articles having correct format and length", async () => {
      const { body: articles } = await request(app)
        .get("/api/articles")
        .expect(200);
      expect(articles).toHaveLength(13);
      expect(Array.isArray(articles)).toBe(true);
      articles.forEach((article) => {
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

    it("should return 200 with articles sorted by date in descending order", async () => {
      const { body } = await request(app).get("/api/articles").expect(200);
      expect(body).toBeSortedBy("created_at", { descending: true });
    });

    it("should return 200 with expected article data", async () => {
      const { body: articles } = await request(app)
        .get("/api/articles")
        .expect(200);
      articles.forEach((article) => {
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
      });
    });

    describe("Filtering by topic", () => {
      it("should return 200 with articles filtered by topic 'mitch'", async () => {
        const { body: articles } = await request(app)
          .get("/api/articles?topic=mitch")
          .expect(200);
        expect(articles).toHaveLength(12);
        articles.forEach((article) => {
          expect(article.topic).toBe("mitch");
        });
      });

      it("should return 200 with articles filtered by topic 'cats'", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=cats")
          .expect(200);
        expect(body).toHaveLength(1);
        expect(body[0].topic).toBe("cats");
      });

      it("should return 200 with an empty array for a topic with no articles", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=paper")
          .expect(200);
        expect(body).toHaveLength(0);
      });
    });

    describe("Error handling for GET /api/articles", () => {
      it("should return 500 for internal server error", async () => {
        await utils.assertInternalServerError(
          "/api/articles",
          "Internal Server Error.",
        );
      });

      it("should return 400 for invalid sort_by", async () => {
        const {
          body: { msg },
        } = await request(app).get("/api/articles?sort_by=invalid").expect(400);
        expect(msg).toBe("Invalid sort_by value: invalid");
      });

      it("should return 400 for invalid order", async () => {
        const {
          body: { msg },
        } = await request(app).get("/api/articles?order=invalid").expect(400);
        expect(msg).toBe("Invalid order value: invalid");
      });

      it("should return 400 for invalid sort_by and order", async () => {
        const {
          body: { msg },
        } = await request(app)
          .get("/api/articles?sort_by=invalid&order=invalid")
          .expect(400);
        expect(msg).toBe(
          "Invalid sort_by value: invalid and Invalid order value: invalid",
        );
      });
    });
  });

  describe("GET /api/topics", () => {
    it("should return 200 with all topics", async () => {
      const {
        body: { topics },
      } = await request(app).get("/api/topics").expect(200);
      expect(topics).toHaveLength(3);
    });

    it("should return 200 with expected topic data", async () => {
      const {
        body: { topics },
      } = await request(app).get("/api/topics").expect(200);
      const expectedTopics = [
        { slug: "mitch", description: "The man, the Mitch, the legend" },
        { slug: "cats", description: "Not dogs" },
        { slug: "paper", description: "what books are made of" },
      ];
      expect(topics).toEqual(expect.arrayContaining(expectedTopics));
    });

    describe("Error handling for GET /api/topics", () => {
      it("should return 500 for internal server error", async () => {
        await utils.assertInternalServerError(
          "/api/topics",
          "Internal Server Error.",
        );
      });
    });
  });

  describe("GET /api/articles/:article_id", () => {
    const testCases = Array.from(
      { length: data.articleData.length },
      (v, i) => [
        i + 1,
        `should return article with ID ${i + 1} and expected article object`,
      ],
    );

    describe.each(testCases)("Article ID %i", (article_id, description) => {
      it(description, async () => {
        const { body } = await request(app)
          .get(`/api/articles/${article_id}`)
          .expect(200);
        expect(body).toEqual(await utils.expectedArticle(article_id));
      });
    });

    describe("Error handling for GET /api/articles/:article_id", () => {
      it("should return 400 for invalid article id", async () => {
        const {
          body: { msg },
        } = await request(app).get(`/api/articles/invalid`).expect(400);
        expect(msg).toBe("Bad Request: Article ID must be a number.");
      });

      it("should return 404 for non-existent article id", async () => {
        const {
          body: { msg },
        } = await request(app).get(`/api/articles/1337`).expect(404);
        expect(msg).toBe("Article not found.");
      });

      it("should return 500 for internal server error", async () => {
        await utils.assertInternalServerError(
          "/api/articles/1",
          "Internal Server Error.",
        );
      });
    });
  });

  describe("GET /api/articles/:article_id/comments", () => {
    it("should return 200 with all comments for an article", async () => {
      const { body } = await request(app)
        .get("/api/articles/1/comments")
        .expect(200);
      expect(body).toHaveLength(11);
    });

    it("should return 200 with expected comment data", async () => {
      const { body: comments } = await request(app)
        .get("/api/articles/1/comments")
        .expect(200);
      expect(comments).toBeSortedBy("created_at", { descending: true });
      comments.forEach((comment) => {
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

    describe("Error handling for GET /api/articles/:article_id/comments", () => {
      it("should return 500 for internal server error", async () => {
        await utils.assertInternalServerError(
          "/api/articles/1/comments",
          "Internal Server Error.",
        );
      });

      it("should return 400 for invalid article id", async () => {
        const {
          body: { msg },
        } = await request(app)
          .get("/api/articles/invalid/comments")
          .expect(400);
        expect(msg).toBe("Bad Request: Article ID must be a number.");
      });

      it("should return 404 for non-existent article id", async () => {
        const {
          body: { msg },
        } = await request(app).get("/api/articles/1337/comments").expect(404);
        expect(msg).toBe("Article not found.");
      });
    });
  });

  describe("POST /api/articles/:article_id/comments", () => {
    const validComment = {
      username: "butter_bridge",
      body: "This is a test comment",
    };

    it("should respond with 201 and create a new comment with the provided username and body", async () => {
      const { body } = await request(app)
        .post("/api/articles/1/comments")
        .send(validComment)
        .expect(201);

      expect(body).toEqual({
        article_id: 1,
        author: "butter_bridge",
        body: "This is a test comment",
      });
    });

    describe("Error Handling for POST /api/articles/:article_id/comments", () => {
      it("should respond with 400 for an invalid article_id", async () => {
        const {
          body: { msg },
        } = await request(app)
          .post("/api/articles/invalid/comments")
          .send(validComment)
          .expect(400);

        expect(msg).toBe("Bad Request: Article ID must be a number.");
      });

      it("should respond with 404 for a non-existent article_id", async () => {
        const {
          body: { msg },
        } = await request(app)
          .post("/api/articles/1337/comments")
          .send(validComment)
          .expect(404);

        expect(msg).toBe("Article not found.");
      });

      it("should respond with 400 for a missing username", async () => {
        const {
          body: { msg },
        } = await request(app)
          .post("/api/articles/1/comments")
          .send({ body: "This is a test comment" })
          .expect(400);

        expect(msg).toBe(
          "Bad Request: The server could not understand the request due to invalid syntax.",
        );
      });

      it("should respond with 400 for a missing body", async () => {
        const {
          body: { msg },
        } = await request(app)
          .post("/api/articles/1/comments")
          .send({ username: "butter_bridge" })
          .expect(400);

        expect(msg).toBe(
          "Bad Request: The server could not understand the request due to invalid syntax.",
        );
      });
    });
  });

  describe("PATCH /api/articles/:article_id", () => {
    const validArticleId = 1;
    const validIncrement = 100;
    const invalidArticleId = "invalid";
    const invalidIncrement = "invalid";

    it("should respond with 200 and update an article by article_id", async () => {
      const {
        body: { votes: originalVotes },
      } = await request(app).get(`/api/articles/${validArticleId}`);
      const { body } = await request(app)
        .patch(`/api/articles/${validArticleId}`)
        .send({ inc_votes: validIncrement })
        .expect(200);

      expect(body).toMatchObject({
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
      it("should respond with 404 for a non-existent article_id", async () => {
        const {
          body: { msg },
        } = await request(app)
          .patch(`/api/articles/1337`)
          .send({ inc_votes: validIncrement })
          .expect(404);

        expect(msg).toBe("Article not found.");
      });

      it("should respond with 400 for an invalid article_id", async () => {
        const {
          body: { msg },
        } = await request(app)
          .patch(`/api/articles/${invalidArticleId}`)
          .send({ inc_votes: validIncrement })
          .expect(400);

        expect(msg).toBe("Bad Request: Article ID must be a number.");
      });

      it("should respond with 400 for a missing inc_votes", async () => {
        const {
          body: { msg },
        } = await request(app)
          .patch(`/api/articles/${validArticleId}`)
          .send({})
          .expect(400);

        expect(msg).toBe("Bad Request: Vote increment must be a number.");
      });

      it("should respond with 400 for an invalid inc_votes", async () => {
        const {
          body: { msg },
        } = await request(app)
          .patch(`/api/articles/${validArticleId}`)
          .send({ inc_votes: invalidIncrement })
          .expect(400);

        expect(msg).toBe("Bad Request: Vote increment must be a number.");
      });

      it("should respond with 400 for a SQL injection attempt in article_id", async () => {
        const {
          body: { msg },
        } = await request(app)
          .patch(`/api/articles/1; DROP TABLE articles;`)
          .send({ inc_votes: validIncrement })
          .expect(400);

        expect(msg).toBe("Bad Request: Article ID must be a number.");
      });
    });
  });

  describe("DELETE /api/comments/:comment_id", () => {
    it("should respond with 204 and delete a comment by comment_id", async () => {
      const { body } = await request(app).delete("/api/comments/1").expect(204);
      expect(body).toEqual({});
    });

    describe("Error Handling for DELETE /api/comments/:comment_id", () => {
      it("should respond with 400 for an invalid comment_id", async () => {
        const {
          body: { msg },
        } = await request(app).delete("/api/comments/invalid").expect(400);

        expect(msg).toBe("Bad Request: Comment ID must be a number.");
      });

      it("should respond with 404 for a non-existent comment_id", async () => {
        const {
          body: { msg },
        } = await request(app).delete("/api/comments/1337").expect(404);

        expect(msg).toBe("Comment not found.");
      });

      it("should respond with 500 for an internal server error", async () => {
        await utils.assertInternalServerError(
          "/api/comments/1",
          "Internal Server Error.",
          "delete",
        );
      });
    });
  });

  describe("GET /api/users", () => {
    const expectedUsers = data.userData;

    it("should respond with 200 and return all users", async () => {
      const { body } = await request(app).get("/api/users").expect(200);
      expect(body).toHaveLength(expectedUsers.length);
      body.forEach((user, index) => {
        expect(user).toMatchObject(expectedUsers[index]);
      });
    });

    describe("Error Handling for GET /api/users", () => {
      it("should respond with 500 for an internal server error", async () => {
        await utils.assertInternalServerError(
          "/api/users",
          "Internal Server Error.",
        );
      });
    });
  });
});