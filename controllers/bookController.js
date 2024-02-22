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
    //filtering
    const queryObj = { ...req.query };
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((ele) => delete queryObj[ele]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    let query = Book.find(JSON.parse(queryStr));

    //sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    //limit
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      query = query.select(fields);
    } else {
      query = query.select("-__v");
    }

    // pagination

    const page = req.query.page;
    const limit = req.query.limit;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    // console.log(page,limit,skip);
    if (req.query.page) {
      const BookCount = await Book.countDocuments();
      if (skip >= BookCount) throw new Error("This Page does not exists");
    }
    const Book = await query;
    res.status(200).json({ Book, counts: Book.length });
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