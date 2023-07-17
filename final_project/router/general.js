const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
        if (isValid(username)) {
          users.push({"username":username,"password":password});
          return res.status(200).json({message: "User successfully registred. Now you can login"});
        } else {
          return res.status(404).json({message: "User already exists!"});
        }
      }
      return res.status(404).json({message: "Unable to register user."});  

});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
      // Use your books data from booksdb.js directly
      const booksList = Object.values(books);
  
      res.json(booksList);
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch the list of books." });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
      const isbn = req.params.isbn;
      const bookDetails = books[isbn];
      if (bookDetails) {
        res.json(bookDetails);
      } else {
        res.status(404).json({ message: `No book found with ISBN: ${isbn}` });
      }
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch book details." });
    }
  });
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
      const author = req.params.author;
      const booksByAuthor = Object.values(books).filter((book) => book.author === author);
      if (booksByAuthor.length > 0) {
        res.json(booksByAuthor);
      } else {
        res.status(404).json({ message: `No books found for author: ${author}` });
      }
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch books by author." });
    }
  });
// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
      const title = req.params.title;
      const booksByTitle = Object.values(books).filter((book) => book.title === title);
      if (booksByTitle.length > 0) {
        res.json(booksByTitle);
      } else {
        res.status(404).json({ message: `No books found for title: ${title}` });
      }
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch books by title." });
    }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn
  res.send(books[isbn].reviews)
});

module.exports.general = public_users;
