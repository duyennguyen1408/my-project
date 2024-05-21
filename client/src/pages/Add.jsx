import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const backendUrl = process.env.REACT_APP_BACKEND_URL;

const Add = () => {
  const [book, setBook] = useState({
    title: "",
    book_desc: "",
    price: null,
    cover: "",
  });

  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "cover") {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL(file.type);
          setBook((prev) => ({ ...prev, cover: dataUrl }));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      setBook((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${backendUrl}/books`, book);
      console.log(book);
      navigate("/");
    } catch (err) {
      console.log(err);
      setError(true);
    }
  };

  return (
    <div className="form">
      <h1>Add New Book</h1>
      <input
        type="text"
        placeholder="Book title"
        name="title"
        onChange={handleChange}
      />
      <textarea
        rows={5}
        type="text"
        placeholder="Book desc"
        name="book_desc"
        onChange={handleChange}
      />
      <input
        type="number"
        placeholder="Book price"
        name="price"
        onChange={handleChange}
      />
      <input type="file" name="cover" onChange={handleChange} />
      <button onClick={handleClick}>Add</button>
      {error && "Something went wrong!"}
      <Link to="/">See all books</Link>
    </div>
  );
};

export default Add;
