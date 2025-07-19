const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: username
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  if (req.session.authorization) {
    let token = req.session.authorization["accessToken"];
    jwt.verify(token, "access", (err, user) => {
        if (!err) {
            // req.user = user;
            
            // Get review text
            let reviewText = req.body.review;

            // Get ISBN query
            let isbn = req.params.isbn;

            // get book object
            const book = books[isbn];

            // get reviews for user
            if (hasUserReviewed(book, user)){
                updateExistingReview(book, user, reviewText);
            }
            else{
                addNewReview(book, user, reviewText);
            }
            return res.status(200).json({message: "Review added successfully"});
        } else {
            return res.status(403).json({ message: "User not authenticated" });
        }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    if (req.session.authorization) {
        let token = req.session.authorization["accessToken"];
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                // req.user = user;
                
                // Get review text
                let reviewText = req.body.review;
    
                // Get ISBN query
                let isbn = req.params.isbn;
    
                // get book object
                const book = books[isbn];
    
                // get reviews for user
                if (hasUserReviewed(book, user)){
                    deleteReview(book, user, reviewText);
                }
                
                return res.status(200).json({message: "Reviews removed successfully."});
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
      } else {
        return res.status(403).json({ message: "User not logged in" });
      }
})

function hasUserReviewed(book, user) {
    const bookReviewList = Object.values(book.reviews);
    const bookReview = bookReviewList.find(review => review.user === user.data);
    
    if (bookReview){
        return true;
    }
    return false;
}

function addNewReview(book, user, reviewText) {    
    book.reviews[Object.keys(book.reviews).length + 1] = {
      user: user.data,
      review: reviewText
    };
}

function updateExistingReview(book, user, reviewText) {    
    const bookReviewList = Object.values(book.reviews);
    const bookReview = bookReviewList.find(review => review.user === user.data);

    if (bookReview){
        bookReview.review = reviewText;
    }
}

function deleteReview(book, user) {
    const reviews = book?.reviews;
    if (!reviews) {
        return;
    }
    
    for (const reviewId in reviews) {
        if (reviews[reviewId].user === user.data) {
            delete reviews[reviewId];
            return;
        }
    }
}

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
