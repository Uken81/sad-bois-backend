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
    console.log("decoded", decoded);

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
      req.user = res[0];
      console.log("requser", req.user);
      return next();
    });
  } else {
    next();
  }
};

module.exports = { validateToken };
