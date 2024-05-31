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

exports.validateQueries = (sort_by, order, topic) => {
  const validSortBy = ["created_at", "author", "title", "topic", "votes"];
  const validOrder = ["asc", "desc"];
  const validTopic = ["cats", "mitch"];

  const invalidSortByMessage = !validSortBy.includes(sort_by)
    ? `Invalid sort_by value: ${sort_by}`
    : "";
  const invalidOrderMessage = !validOrder.includes(order)
    ? `Invalid order value: ${order}`
    : "";
  const invalidTopicMessage =
    topic && !validTopic.includes(topic) ? `Invalid topic value: ${topic}` : "";

  const errorMessages = [
    invalidSortByMessage,
    invalidOrderMessage,
    invalidTopicMessage,
  ].filter(Boolean);

  if (errorMessages.length > 0) {
    const err = new Error();
    err.msg = errorMessages.join(" and ");
    err.status = 400;
    throw err;
  }
};

exports.createAssertInternalServerError = (db, app, request) => {
  return async (requestPath, expectedMsg, method = "get", requestBody = null) => {
    const mockQuery = jest
      .spyOn(db, "query")
      .mockRejectedValueOnce(new Error("Database error"));

    let response;
    switch (method.toLowerCase()) {
      case "post":
        response = await request(app)
          .post(requestPath)
          .send(requestBody)
          .expect(500);
        break;
      case "patch":
        response = await request(app)
          .patch(requestPath)
          .send(requestBody)
          .expect(500);
        break;
      case "delete":
        response = await request(app).delete(requestPath).expect(500);
        break;
      default:
        response = await request(app).get(requestPath).expect(500);
        break;
    }

    expect(response.body.msg).toEqual(expectedMsg);
    mockQuery.mockRestore();
  };
};
