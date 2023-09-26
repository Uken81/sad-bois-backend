const express = require("express");
const connection = require("../server");

const router = express.Router();

router.get("/", (req, res) => {
  // Define your SQL query
  const query = "SELECT * FROM products";

  // Execute the query
  connection.query(query, (err, results) => {
    console.log("stage1");
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Database error");
    } else {
      // console.log("products:", results);
      // You can process the 'results' array here and send it as a response
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
      // console.log("featured: ", results);
      res.json(results);
    }
  });
});

router.get("/byId", (req, res) => {
  const id = req.query.id;
  console.log("id**: ", id);
  const query = "SELECT * FROM products WHERE id = ?";

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Database error");
    } else {
      console.log("selected: ", results);
      res.json(results);
    }
  });
});

module.exports = router;
