const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'NAFTAL DayOff-Tracking API' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
