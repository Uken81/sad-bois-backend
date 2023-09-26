const express = require("express");
const connection = require("../server");
const router = express.Router();
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  const { email, username, password, confirmedPassword } = req.body;
  // console.log("email ", email);
  // console.log("username", username);
  // console.log("password ", password);
  // console.log("confirmedPassword ", confirmedPassword);

  if (password !== confirmedPassword) {
    res.json({
      message: "Passwords do not match.",
      success: false,
      type: "password-match",
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

    if (results.length > 0) {
      res.json({
        message: "Email already registered.",
        success: false,
        type: "email",
      });
      return;
    }
  });

  const query =
    "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";

  connection.query(query, [email, username, passwordHashed], (err, result) => {
    if (err) {
      res.status(500).send("Error adding new user");
    } else {
      console.log("New user added. Insert ID:", result.insertId);
      res.json({ message: "Data inserted successfully", success: true });
    }
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("creds", email, password);

  const query = "SELECT username, email, password FROM users WHERE email = ?";

  connection.query(query, [email], async (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      res.status(500).json({ message: "Server error" });
      return;
    }

    if (results.length === 0) {
      res.json({ message: "Invalid email", success: false, type: "duplicate" });
      return;
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.json({ message: "Login successful" });
    } else {
      res
        .status(401)
        .json({
          message: "Invalid password",
          success: false,
          type: "password",
        });
    }
  });
});

module.exports = router;
