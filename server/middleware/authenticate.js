let { User } = require('./../users/model');

let authenticate = async (req, res, next) => {
  let token = req.header('x-auth');

  try {
    let user = await User.findByToken(token);

    if (!user) {
      throw new Error(); // Equivalent to return Promise.reject(); in async-await
    }

    req.user = user;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send();
  }
};

module.exports = {
  authenticate
};
