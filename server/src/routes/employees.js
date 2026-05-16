const express = require('express')
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  deleteAllEmployees,
  importEmployees,
} = require('../controllers/employeesController')

const router = express.Router()

router.get('/', getEmployees)
router.get('/:id', getEmployeeById)
router.post('/', createEmployee)
router.post('/delete-all', deleteAllEmployees)
router.post('/import', importEmployees)

module.exports = router
