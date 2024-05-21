import express from "express";
import mysql from "mysql";
import cors from "cors";

import multer from "multer";
import AWS from "aws-sdk";
import fs from "fs";

// const multer = require("multer"); // For file uploads
// const AWS = require("aws-sdk"); // For AWS S3 interaction

const app = express();
app.use(cors());
app.use(express.json());

const s3 = new AWS.S3();

// Configure Multer for file uploads (modify destination if needed)
const upload = multer({ dest: "uploads/" }); // Temporary directory for uploads

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
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

app.post("/books", upload.single("cover"), (req, res) => {
    const q =
        "INSERT INTO books(`title`, `book_desc`, `price`, `cover`) VALUES (?)";

    let values = [req.body.title, req.body.book_desc, req.body.price];

    // Handle image upload to S3
    if (req.file) {
        const params = {
            Bucket: "group-1-blog", // Replace with your S3 bucket name
            Key: req.file.filename + "." + req.file.mimetype.split("/")[1],
            Body: fs.createReadStream(req.file.path),
        };
        
        console.log(req.file);
        s3.upload(params, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error uploading image to S3");
            }

            // Update cover URL with the uploaded image location
            values.push(data.Location);

            // Insert data into database with updated cover URL
            db.query(q, [values], (err, data) => {
                if (err) return res.send(err);
                return res.json(data);
            });
        });
    } else {
        // Handle case where no image is uploaded (set cover to null or default)
        values.push(null); // Or your default cover value

        db.query(q, [values], (err, data) => {
            if (err) return res.send(err);
            return res.json(data);
        });
    }
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