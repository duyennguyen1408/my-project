import express from "express";
import mysql from "mysql";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: "rds_endpoint",
    user: "admin",
    password: "12345678",
    database: "group1",
});
db.connect((error) => {
    if (error) {
        console.error("Error connecting to MySQL database:", error);
    } else {
        console.log("Connected to MySQL database!");
    }
});

app.get("/", (req, res) => {
    res.json("This is Group 1 website.");
});

app.get("/books", (req, res) => {
    const q = "SELECT * FROM books";
    db.query(q, (err, data) => {
        if (err) {
            console.log(err);
            return res.json(err);
        }
        return res.json(data);
    });
});

app.post("/books", (req, res) => {
    const q =
        "INSERT INTO books(`title`, `book_desc`, `price`, `cover`) VALUES (?)";

    const values = [
        req.body.title,
        req.body.book_desc,
        req.body.price,
        req.body.cover,
    ];

    db.query(q, [values], (err, data) => {
        if (err) return res.send(err);
        return res.json(data);
    });
});

app.delete("/books/:id", (req, res) => {
    const bookId = req.params.id;
    const q = " DELETE FROM books WHERE id = ? ";

    db.query(q, [bookId], (err, data) => {
        if (err) return res.send(err);
        return res.json(data);
    });
});

app.put("/books/:id", (req, res) => {
    const bookId = req.params.id;
    const q =
        "UPDATE books SET `title`= ?, `book_desc`= ?, `price`= ?, `cover`= ? WHERE id = ?";

    const values = [
        req.body.title,
        req.body.book_desc,
        req.body.price,
        req.body.cover,
    ];

    db.query(q, [...values, bookId], (err, data) => {
        if (err) return res.send(err);
        return res.json(data);
    });
});

app.listen(8800, () => {
    console.log("Connected to backend. Port 8800.");
});
