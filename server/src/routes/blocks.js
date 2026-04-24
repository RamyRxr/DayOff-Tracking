const express = require('express')
const {
  getBlocks,
  createBlock,
  unblockBlock,
} = require('../controllers/blocksController')

const router = express.Router()

router.get('/', getBlocks)
router.post('/', createBlock)
router.patch('/:id/unblock', unblockBlock)

module.exports = router
