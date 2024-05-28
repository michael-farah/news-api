const app = require("../app");
const request = require("supertest");
const db = require("../db/connection");
const data = require("../db/data/test-data/index");
const seed = require("../db/seeds/seed");

beforeEach(() => seed(data)); // Seed the database with the test data

afterAll(() => db.end()); // Close the database connection

// Test suite for handling unknown routes
describe("Error handling for unknown routes", () => {
  test("404: Path not found", async () => {
    // Send a GET request to an unknown route
    const response = await request(app).get("/api/unknown");

    // Assert the response status and message
    expect(response.status).toBe(404);
    expect(response.body.msg).toBe("Path not found");
  });
});

// Test suite for GET /api/topics
describe("GET /api/topics", () => {
  test("200: Return all topics", async () => {
    // Send a GET request to /api/topics
    const response = await request(app).get("/api/topics");

    // Assert the response status and length of topics array
    expect(response.status).toBe(200);
    expect(response.body.topics).toHaveLength(3);
  });

  test("200: Return expected topic data", async () => {
    // Send a GET request to /api/topics
    const response = await request(app).get("/api/topics");

    // Define the expected topics data
    const expectedTopics = [
      { slug: "mitch", description: "The man, the Mitch, the legend" },
      { slug: "cats", description: "Not dogs" },
      { slug: "paper", description: "what books are made of" },
    ];

    // Assert the response status and topics data
    expect(response.status).toBe(200);
    expect(response.body.topics).toEqual(
      expect.arrayContaining(expectedTopics),
    );
  });

  test("500: Internal Server Error", async () => {
    // Mock the database query to throw an error
    const mockQuery = jest
      .spyOn(db, "query")
      .mockRejectedValueOnce(new Error("Database error"));

    // Send a GET request to /api/topics
    const response = await request(app).get("/api/topics");

    // Assert the response status and error message
    expect(response.status).toBe(500);
    expect(response.body.msg).toBe("Internal Server Error");

    // Restore the original implementation of the database query
    mockQuery.mockRestore();
  });
});
