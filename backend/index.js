import express from "express";
import mysql from "mysql";
import cors from "cors";
import AWS from "aws-sdk";
import fs from "fs";
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(express.json());

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const s3 = new AWS.S3();

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

app.post("/books", (req, res) => {
    const q =
        "INSERT INTO books(`title`, `book_desc`, `price`, `cover`) VALUES (?)";

    let values = [req.body.title, req.body.book_desc, req.body.price];

    // Your CloudFront distribution domain
    const cloudFrontDomain = "https://d1idlrw0osxj8u.cloudfront.net/";

    // Handle image upload to S3
    if (req.body.cover) {
        const base64Data = req.body.cover.replace(
            /^data:image\/\w+;base64,/,
            ""
        );
        const buffer = Buffer.from(base64Data, "base64");

        const params = {
            Bucket: "group-1-blog", // Replace with your S3 bucket name
            Key: "img/" + Date.now() + ".png",
            Body: buffer,
            ContentEncoding: "base64",
            ContentType: "image/png",
            ACL: "public-read", // Make the file publicly readable
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error uploading image to S3");
            }

            // Construct CloudFront URL
            const cloudFrontUrl = cloudFrontDomain + params.Key;

            // Update cover URL with the CloudFront URL
            values.push(cloudFrontUrl);

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
