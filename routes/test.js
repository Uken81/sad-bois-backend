const express = require("express");
const connection = require("../server");

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("req", req.body);
  //   console.log("res", res);
  console.log("test");
  const { email, username, password } = req.body;
  console.log("email ", email);
  console.log("username", username);
  console.log("password ", password);

  console.log("Backend route was hit");
  const query =
    "INSERT INTO users (email, username, password) VALUES (?, ?, ?)";
  const values = [email, username, password];

  connection.query(query, values, (err, result) => {
    if (err) {
      console.error("Error adding new post:", err);
      res.status(500).send("Error adding new post");
    } else {
      console.log("New post added. Insert ID:", result.insertId);
      //   res.status(200).send("Data inserted successfully");
      res.status(200).json({ message: "Data inserted successfully" });
      //   res.send("New post added successfully");
    }
  });
});

module.exports = router;
