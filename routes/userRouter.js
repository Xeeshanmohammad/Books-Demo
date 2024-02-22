const express = require('express');
const router = express.Router()
const { getAllUsers, getSingleUser, deleteUser, updateUser } = require('../controllers/userControlles')
const { authMiddleware, isAdmin } = require('../middleware/authentication');


router.get('/getAllUsers', authMiddleware, getAllUsers)
router.get('/getSingleUser/:id',authMiddleware,isAdmin, getSingleUser)
router.put("/updateUser",authMiddleware, updateUser)
router.delete("/deleteUser/:id", deleteUser)


module.exports = router