const Book = require("../models/bookSchema");
const asyncHandler = require("express-async-handler");
var slugify = require("slugify");

const createBook = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const newBook = await Book.create(req.body);
    res.status(201).json({ newBook });
  } catch (error) {
    throw new Error("Something went wrong!", error);
  }
});

const getAllBook = asyncHandler(async (req, res) => {
  try {
    const Books = await Book.find({})
    res.status(200).json({ Books, counts: Books.length });
  } catch (error) {
    throw new Error(error);
  }
});

const getSingleBook = asyncHandler(async (req, res) => {
  try {
    const getBook = await Book.findById(req.params.id);
    res.status(201).json({ getBook });
  } catch (error) {
    throw new Error("Something went wrong!", error);
  }
});

const updateBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    const updateBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(201).json({ updateBook });
  } catch (error) {
    throw new Error("Something went wrong!", error);
  }
});

const deleteBook = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    await Book.findByIdAndDelete(id, req.body, {
      new: true,
    });
    res.status(201).json({ message: "Book deleted successfully" });
  } catch (error) {
    throw new Error("Something went wrong!", error);
  }
});


module.exports = {
  createBook,
  getSingleBook,
  getAllBook,
  updateBook,
  deleteBook
}