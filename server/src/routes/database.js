const express = require('express')
const { getSchema, addColumn, editColumn, deleteColumn } = require('../controllers/databaseController')

const router = express.Router()

router.get('/schema', getSchema)
router.post('/add-column', addColumn)
router.post('/edit-column', editColumn)
router.post('/delete-column', deleteColumn)

module.exports = router
