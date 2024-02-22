const express = require('express');
const { createUser, userLogin,  handleRefreshToken, userLogout, updatePassword, forgotPassword, resetPassword, adminLogin } = require('../controllers/authContoller');
const { authMiddleware } = require('../middleware/authentication');
const router = express.Router()

router.post('/userRegister', createUser)
router.post('/userLogin', userLogin )
router.post('/adminLogin', adminLogin )
router.get("/refershToken",handleRefreshToken)        
router.get("/logoutUser", userLogout)
router.put("/updatePass",authMiddleware ,updatePassword)
router.post("/forgotPassword", forgotPassword)
router.put("/resetPassword/:token", resetPassword)

module.exports = router