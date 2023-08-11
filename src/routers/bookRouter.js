import express from "express";
import { ERROR, SUCCESS } from "../Constant.js";
import {
  addBook,
  findBookAndDelete,
  findBookAndUpate,
  getAllBooks,
  getBookById,
  getBookByIsbn,
  getBorrowedBooks,
} from "../models/Book/BookModel.js";

import { getUserById } from "../models/User/userModel.js";

import {
  postTransaction,
  findTransactionAndUpdate,
  getTransactionByQuery,
} from "../models/Transaction/TransactionModel.js";

const router = express.Router();

//get books
router.get("/", async (req, res, next) => {
  try {
    const books = await getAllBooks();

    if (books) {
      return res.json({ books });
    }
    return;
  } catch (error) {
    next(error);
  }
});

//get borrowed books by specific users
router.get("/borrowedBooks", async (req, res, next) => {
  try {
    const books = await getBorrowedBooks(req.headers.authorization);

    return res.json(books);
  } catch (error) {
    next(error);
  }
});

//add book
router.post("/", async (req, res, next) => {
  const { isbn } = req.body;
  try {
    const bookExists = await getBookByIsbn(isbn);

    if (bookExists?._id) {
      return res.json({
        status: ERROR,
        message: "Book already exists!",
      });
    }

    const book = await addBook(req.body);

    return book?._id
      ? res.json({ status: SUCCESS, message: "Book added successfully!" })
      : res.json({
          status: ERROR,
          message: "Unable to add book. Please try agin!",
        });
  } catch (error) {
    next(error);
  }
});

//borrow a book
router.post("/borrow", async (req, res, next) => {
  try {
    const bookId = req.body.bookId;
    const { authorization } = req.headers;

    const book = await getBookById(bookId);
    const user = await getUserById(authorization);

    if (book?._id && user?._id) {
      if (book?.borrowedBy.length) {
        return res.json({
          status: "error",
          message:
            "The book has already been borrowed and will be available once it has been returned.",
        });
      }

      const { isbn, thumbnail, title, author, year } = book;

      const transaction = await postTransaction({
        borrowedBy: {
          userId: user?._id,
          userName: user?.fName,
        },
        borrowedBook: {
          isbn,
          thumbnail,
          title,
          author,
          year,
        },
      });

      if (transaction?._id) {
        const updateBook = await findBookAndUpate(bookId, {
          $push: { borrowedBy: user._id },
        });
        console.log("updateBook", updateBook);
        return updateBook?._id
          ? res.json({
              staus: SUCCESS,
              message: "You have borrowed this book!",
            })
          : res.json({
              status: "error",
              message: "Something went wrong. Please try again!",
            });
      }

      return res.json({
        status: ERROR,
        message: "Unable to register transaction",
      });
    }
  } catch (error) {
    next(error);
  }
});

//return a book
router.patch("/return", async (req, res, next) => {
  try {
    const book = await getBookById(req.body.bookId);
    const user = await getUserById(req.headers.authorization);

    const transaction = await getTransactionByQuery(user?._id, book?.isbn);

    const updateTransaction = await findTransactionAndUpdate(transaction?._id, {
      returnDate: new Date(),
    });

    if (updateTransaction?.returnDate) {
      const updateBook = await findBookAndUpate(book._id, {
        // $pullAll: [{ borrowedBy: [user] }],
        $pull: { borrowedBy: user._id },
      });

      return updateBook?._id
        ? res.json({
            status: SUCCESS,
            message: "You have returned this book!",
          })
        : res.json({
            status: ERROR,
            message: "Unable to return this book. Please try again later",
          });
    }
  } catch (error) {}
});

//delete a book
router.delete("/", async (req, res, next) => {
  try {
    const book = await getBookById(req.body.bookId);
    if (book?.borrowedBy.length) {
      return res.json({
        status: SUCCESS,
        message:
          "Unable to delete this book. This Book is currently being borrowed by someone else. ",
      });
    }

    const deletedBook = await findBookAndDelete(req.body.bookId);
    deletedBook?._id
      ? res.json({
          status: SUCCESS,
          message: "Book deleted successfully!",
        })
      : res.json({
          status: ERROR,
          message: "Error deleting the book!",
        });
  } catch (error) {
    next(error);
  }
});

export default router;
