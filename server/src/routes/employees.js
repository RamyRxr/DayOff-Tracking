const express = require('express')
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
} = require('../controllers/employeesController')

const router = express.Router()

router.get('/', getEmployees)
router.get('/:id', getEmployeeById)
router.post('/', createEmployee)

module.exports = router
