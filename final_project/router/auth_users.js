const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let userswiththesamename = users.filter((user)=>{
        return user.username === username
    });
    if (userswiththesamename.length > 0){
        return false;
    } else {
        return true;
    }
}

const authenticatedUser = (username,password)=>{
    let validusers = users.filter((user)=>{
      return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
      return true;
    } else {
      return false;
    }
  }

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password){
        res.status(404).json({message:"Error logging in"});
    }
    if (authenticatedUser(username,password)) {
        let accessToken = jwt.sign({
          data: password
        }, 'access', { expiresIn: 60 * 60 });
        req.session.authorization = {
          accessToken,username
      }
      return res.status(200).send("User successfully logged in");
      } else {
        return res.status(401).json({message: "Invalid Login. Check username and password"});
      }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const sessionUsername = req.session.authorization?.username;

    if (!sessionUsername) {
        return res.status(401).json({ message: "User not logged in" });
    }
    let book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found!" });
    }
    const review = req.query.review;
    if (!review) {
        return res.status(400).json({ message: "Review not provided" });
    }
    if (!Array.isArray(book.reviews)) {
        book.reviews = [];
    }
    const existingReview = book.reviews.find((rev) => rev.username === sessionUsername);

    if (existingReview) {
        existingReview.review = review;
    } else {
        // Add a new review
        book.reviews.push({ username: sessionUsername, review: review });
    }
    res.send(`Review for the book with ISBN ${isbn} has been added/modified.`);
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const sessionUsername = req.session.authorization?.username;

    if (!sessionUsername) {
        return res.status(401).json({ message: "User not logged in" });
    }
    let book = books[isbn];
    if (!book) {
        return res.status(404).json({ message: "Book not found!" });
    }
    if (!Array.isArray(book.reviews)) {
        return res.status(404).json({ message: "No reviews found for this book" });
    }
    const reviewIndex = book.reviews.findIndex((rev) => rev.username === sessionUsername);
    if (reviewIndex === -1) {
        return res.status(404).json({ message: "You do not have a review for this book" });
    }
    book.reviews.splice(reviewIndex, 1);
    res.send(`Review for the book with ISBN ${isbn} has been deleted.`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
