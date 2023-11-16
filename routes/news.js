const express = require("express");
const connection = require("../server");

const router = express.Router();

const isEmptyResults = (results) => {
  if (results.length === 0) {
    return true;
  }

  return false;
};

router.get("/", (req, res) => {
  const query = "SELECT * FROM news ORDER BY date DESC;";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: ", err);
      res.status(500).json({
        error: "Datbase error occured",
        details: err.message,
        fatalError: err.fatal,
      });
    }

    if (isEmptyResults(results)) {
      return res.status(404).json({
        error: "No news found",
      });
    }

    res.json(results);
  });
});

router.get("/latest", (req, res) => {
  const query = "SELECT * FROM news ORDER BY date DESC LIMIT 3;";

  connection.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query: ", err);
      res.status(500).json({
        error: "Datbase error occured",
        details: err.message,
        fatalError: err.fatal,
      });
    }

    if (isEmptyResults(results)) {
      return res.status(404).json({
        error: "No news found",
      });
    }

    res.json(results);
  });
});

router.get("/byId", (req, res) => {
  const id = req.query.id;
  const query = "SELECT * FROM news WHERE id = ? LIMIT 1";

  if (!id) {
    return res.status(400).json({
      error: "No ID provided",
    });
  }

  connection.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error executing query: ", err);
      res.status(500).json({
        error: "Datbase error occured",
        details: err.message,
        fatalError: err.fatal,
      });
    }

    if (isEmptyResults(results)) {
      return res.status(404).json({
        error: "No news with that id found",
      });
    }

    res.json(results[0]);
  });
});

module.exports = router;
