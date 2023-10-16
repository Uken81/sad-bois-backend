const express = require("express");
const connection = require("../server");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateToken } = require("../Middleware/authMiddleware");

router.post("/register", async (req, res) => {
  const { email, username, password, confirmedPassword } = req.body;

  if (password !== confirmedPassword) {
    res.json({
      message: "Passwords do not match.",
      success: false,
      type: "password",
    });
    return;
  }

  const passwordHashed = await bcrypt.hash(password, 10);

  const duplicteQuery = "SELECT email FROM users WHERE email = ?";
  connection.query(duplicteQuery, [email], async (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ message: "Server error" });
      return;
    }
    console.log(results);
    if (results.length > 0) {
      res.json({
        message: "Email already registered.",
        success: false,
        type: "email",
      });
      console.log("duplicate");
    } else {
      console.log("not duplicate");
      const query =
        "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";

      connection.query(
        query,
        [email, username, passwordHashed],
        (err, result) => {
          if (err) {
            res.status(500).send("Error adding new user");
          } else {
            console.log("New user added. Insert ID:", result.insertId);
            res.json({ message: "Data inserted successfully", success: true });
          }
        }
      );
    }
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("creds", email, password);

  const query =
    "SELECT id, username, email, password FROM users WHERE email = ?";

  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ message: "Server error" });
      return;
    }

    if (results.length === 0) {
      res.json({ message: "Invalid email", success: false, type: "email" });
      return;
    }

    const user = results[0];
    console.log("user: ", user);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      console.log("token", token);
      const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
      };
      res.cookie("jwt", token, cookieOptions);
      res.json({ message: "Login successful", success: true, user });
    } else {
      res.json({
        message: "Invalid password",
        success: false,
        type: "password",
      });
    }
  });
});

router.get("/validate", validateToken, async (req, res) => {
  const user = req.user;

  if (!user) {
    res.json({
      validationSuccess: false,
      message: "Failed to validate user.",
    });
    return;
  }

  res.json({
    validationSuccess: true,
    message: "Successfully validated user.",
  });
});

router.get("/logout", async (req, res) => {
  res.cookie("jwt", "logout", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });
  res.json({ message: "User logged out" });
});

module.exports = router;
