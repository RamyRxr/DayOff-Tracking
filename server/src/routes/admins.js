const express = require('express')
const { getAdmins, verifyPin } = require('../controllers/adminsController')

const router = express.Router()

router.get('/', getAdmins)
router.post('/verify-pin', verifyPin)

module.exports = router
