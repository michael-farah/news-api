const { getUsers } = require("../models/users");

exports.getUsers = async (req, res, next) => {
  try {
    const users = await getUsers();
    res.status(200).send(users);
  } catch (error) {
    next(error);
  }
};