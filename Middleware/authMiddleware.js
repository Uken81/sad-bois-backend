const { error } = require("console");
const connection = require("../server");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const validateToken = async (req, res, next) => {
  console.log("cookies", req.cookies);
  if (req.cookies.jwt) {
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const query = "SELECT * FROM users WHERE id = ?";
    connection.query(query, [decoded.id], async (err, res) => {
      if (err) {
        console.error("Error querying the database:", err);
        res.status(500).json({ message: "Server error" });
        return;
      }
      console.log("resy", res);
      if (!res) {
        console.log("no user found");
        return next();
      }

      function setUser() {
        if (res.length > 1) {
          throw new error("Multiple users with same id found");
        }

        return res[0];
      }
      req.user = setUser();
      console.log("requser", req.user);
      return next();
    });
  } else {
    next();
  }
};

module.exports = { validateToken };
