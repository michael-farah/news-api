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

exports.validateSortAndOrder = (sort_by, order) => {
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
};
