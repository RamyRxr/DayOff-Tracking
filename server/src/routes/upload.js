const express = require('express')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

const router = express.Router()

const uploadsDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir)
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/\s+/g, '-')
        cb(null, `${Date.now()}-${safeName}`)
    },
})

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (!allowedTypes.includes(file.mimetype)) {
            const err = new Error('Type de fichier non autorisé')
            err.code = 'INVALID_FILE_TYPE'
            return cb(err)
        }
        return cb(null, true)
    },
})

router.post('/', (req, res) => {
    upload.single('file')(req, res, (error) => {
        if (error) {
            if (error.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ error: 'Fichier trop volumineux (max 5 Mo)' })
            }
            if (error.code === 'INVALID_FILE_TYPE') {
                return res.status(400).json({ error: 'Type de fichier non autorisé' })
            }
            console.error('Upload error:', error)
            return res.status(500).json({ error: 'Upload failed' })
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' })
        }

        return res.json({
            data: {
                filename: req.file.filename,
                path: `/uploads/${req.file.filename}`,
                size: req.file.size,
            },
        })
    })
})

module.exports = router
