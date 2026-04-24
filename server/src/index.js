const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })

const employeesRouter = require('./routes/employees')
const adminsRouter = require('./routes/admins')
const daysOffRouter = require('./routes/daysoff')
const blocksRouter = require('./routes/blocks')
const uploadRouter = require('./routes/upload')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/employees', employeesRouter)
app.use('/api/admins', adminsRouter)
app.use('/api/daysoff', daysOffRouter)
app.use('/api/blocks', blocksRouter)
app.use('/api/upload', uploadRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
