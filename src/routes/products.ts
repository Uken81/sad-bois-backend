import express, { Response, Request } from "express";
import { QueryError, RowDataPacket } from "mysql2";
import connection from "../server";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
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

router.get("/featured", (req: Request, res: Response) => {
  const query = "SELECT * FROM products WHERE isFeatured = 1";

  connection.query(query, (err: QueryError, results: RowDataPacket[]) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).send("Database error");
    } else {
      res.json(results);
    }
  });
});

router.get("/byId", (req: Request, res: Response) => {
  const id = req.query.id;
  console.log("id**: ", id);
  const query = "SELECT * FROM products WHERE id = ? LIMIT 1";

  connection.query(
    query,
    [id],
    (err: QueryError | null, results: RowDataPacket[]) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).send("Database error");
      } else {
        console.log("selected: ", results);
        res.json(results[0]);
      }
    }
  );
});

// module.exports = router;
export default router;
