const express = require("express");
const connection = require("../server");

const router = express.Router();

router.get("/", (req, res) => {
  const query = "SELECT * FROM news";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Database error");
    } else {
      res.json(results);
    }
  });
});

router.get("/byId", (req, res) => {
  const id = req.query.id;

  console.log("req");
  const query = "SELECT * FROM news WHERE id = ? LIMIT 1";
  console.log("rest");
  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Database error");
    } else {
      res.json(results[0]);
      console.log("art", results);
    }
  });
});

module.exports = router;
