const express = require("express");
const connection = require("../server");

const router = express.Router();

router.get("/", (req, res) => {
  const query = "SELECT * FROM tour ORDER BY date DESC;";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Database error");
    } else {
      console.log("tourres", results);
      res.json(results);
    }
  });
});

module.exports = router;
