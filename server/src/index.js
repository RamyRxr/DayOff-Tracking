import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import employeesRouter from './routes/employees.js'
import daysOffRouter from './routes/daysoff.js'
import blocksRouter from './routes/blocks.js'
import adminsRouter from './routes/admins.js'

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/employees', employeesRouter)
app.use('/api/daysoff', daysOffRouter)
app.use('/api/blocks', blocksRouter)
app.use('/api/admins', adminsRouter)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    error: err.message || 'Internal server error',
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`)
})
