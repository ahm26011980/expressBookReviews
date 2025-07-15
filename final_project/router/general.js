const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Function to check if the user exists
const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(400).json({ message: "User already exists!" });
    }
  }
  return res.status(400).json({ message: "Unable to register user, username or password is not provided" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.end(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here  
  let isbn = req.params.isbn;  
  if (isbn){    
    const selectedBook = books[isbn];
    res.end(JSON.stringify(selectedBook));
  }
  else{
    return res.status(400).json({message: "ISBN parameter is empty"});
  }  
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here  
  let author = req.params.author;
  if (author){
    const bookList = Object.values(books);
    const selectedBook = bookList.find(book => book.author === author);
    res.end(JSON.stringify(selectedBook));
  }
  else{
    return res.status(400).json({message: "Author parameter is empty"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  let title = req.params.title;
  if (title){
    const bookList = Object.values(books);
    const selectedBook = bookList.find(book => book.title === title);
    res.end(JSON.stringify(selectedBook));
  }
  else{
    return res.status(400).json({message: "Title parameter is empty"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  let isbn = req.params.isbn;
  if (isbn){    
    const selectedBook = books[isbn];
    res.end(JSON.stringify(selectedBook.reviews));
  }
  else{
    return res.status(400).json({message: "ISBN parameter is empty"});
  }
});

module.exports.general = public_users;
