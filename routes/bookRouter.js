const express = require("express");

const {
  createBook,
  getAllBook,
  getSingleBook,
  updateBook,
  deleteBook
} = require("../controllers/bookController");
const { isAdmin, authMiddleware } = require("../middleware/authentication");
const router = express.Router();

router.post("/addBook", authMiddleware, isAdmin, createBook);
router.get("/allBook", authMiddleware, isAdmin, getAllBook); 
router.get("/getBook/:id", authMiddleware, isAdmin, getSingleBook);
router.put("/updateBook/:id", authMiddleware, isAdmin, updateBook);
router.delete("/deleteBook/:id", authMiddleware, isAdmin, deleteBook);

module.exports = router;