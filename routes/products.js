const express = require("express");
const connection = require("../server");

const router = express.Router();

router.get("/", (req, res) => {
  const query = "SELECT * FROM products";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Database error");
    } else {
      res.json(results);
    }
  });
});

router.get("/featured", (req, res) => {
  const query = "SELECT * FROM products WHERE isFeatured = 1";

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
  console.log("id**: ", id);
  const query = "SELECT * FROM products WHERE id = ? LIMIT 1";

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Database error");
    } else {
      console.log("selected: ", results);
      res.json(results[0]);
    }
  });
});

module.exports = router;
