const express = require('express')
const { getDaysOff, createDayOff } = require('../controllers/daysoffController')

const router = express.Router()

router.get('/', getDaysOff)
router.post('/', createDayOff)

module.exports = router
