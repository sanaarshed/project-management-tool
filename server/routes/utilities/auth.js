const jwt = require("jsonwebtoken");
const { jwtConfig } = require("../../config");
const { User } = require("../../db/models");
const bearerToken = require("express-bearer-token");
const datetime = require("date-and-time");
const { secret, expiresIn } = jwtConfig;

const getUserToken = (user) => {
  const userDataForToken = {
    id: user.id,
    email: user.email,
  };
  const expiration_time = datetime.addHours(new Date(), 2); // Add 2 hours to the current time

  // Convert the expiration time to a Unix timestamp (in seconds)
  const exp_timestamp = Math.floor(expiration_time / 1000);

  // const token = jwt.sign({ data: userDataForToken }, secret);
  // const token = jwt.sign({ data: userDataForToken }, process.env.JWT_SECRET);
  // console.log("process.env.JWT_SECRET--->", process.env.JWT_SECRET);
  const token = jwt.sign({ data: userDataForToken }, process.env.JWT_SECRET, {
    expiresIn: exp_timestamp,
  });

  return token;
};

const restoreUser = (req, res, next) => {

  const { token } = req;

  if (!token) {
    return res.set("WWW-Authenticate", "Bearer").status(401).end();
  }
  console.log("token-->", token);
  //Changed jwt token here as well
  return jwt.verify(
    token,
    process.env.JWT_SECRET,
    null,
    async (err, jwtPayload) => {
      if (err) {
        err.status = 401;
        return next(err);
      }

      const { id } = jwtPayload.data;
      try {
        req.user = await User.findByPk(id);
      } catch (e) {
        return next(e);
      }
      if (!req.user) {
        return res.set("WWW-Authenicate", "Bearer").status(401).end();
      }
      return next();
    }
  );
};

const tokenVerify = (token) => {

  return jwt.verify(
    token,
    process.env.JWT_SECRET,
    null,
    async (err, jwtPayload) => {
      if (err) {
        err.status = 401;
        return err;
      }
      return jwtPayload.data
    }
  );
};

const requireAuth = [bearerToken(), restoreUser];
module.exports = { getUserToken, requireAuth, tokenVerify};
