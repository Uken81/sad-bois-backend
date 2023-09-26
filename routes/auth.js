const express = require("express");
const connection = require("../server");
const router = express.Router();
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  const { email, username, password, confirmedPassword } = req.body;
  console.log("email ", email);
  console.log("username", username);
  console.log("password ", password);
  console.log("confirmedPassword ", confirmedPassword);
  const passwordHashed = await bcrypt.hash(password, 10);
  const confirmedPasswordHashed = await bcrypt.hash(confirmedPassword, 10);
  console.log("hash", passwordHashed);
  console.log("chash", confirmedPasswordHashed);

  if (passwordHashed !== confirmedPasswordHashed) {
    res.json({ message: "Passwords do not match." });
    return;
  }
  const query =
    "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
  const values = [email, username, passwordHashed];
  // const values = [email, username, password];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error adding new post:", err);
      res.status(500).send("Error adding new post");
    } else {
      console.log("New user added. Insert ID:", result.insertId);
      //   res.status(200).send("Data inserted successfully");
      res.status(200).json({ message: "Data inserted successfully" });
      //   res.send("New post added successfully");
    }
  });
});

module.exports = router;
