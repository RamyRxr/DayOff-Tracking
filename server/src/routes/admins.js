const express = require('express')
const { getAdmins, verifyPin, createAdmin, deleteAdmin } = require('../controllers/adminsController')

const router = express.Router()

router.get('/', getAdmins)
router.post('/verify-pin', verifyPin)
router.post('/', createAdmin)
router.delete('/:id', deleteAdmin)

module.exports = router
