const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { generateBlockNote, generateUnblockNote } = require('../utils/docxGenerator');
const path = require('path');
const fs = require('fs');

/**
 * Generate block note PDF
 * GET /api/pdf/block/:blockId
 */
router.get('/block/:blockId', async (req, res) => {
    try {
        const { blockId } = req.params;

        const block = await prisma.block.findUnique({
            where: { id: blockId },
            include: {
                employee: true,
                admin: true,
            },
        });

        if (!block) {
            return res.status(404).json({ error: 'Block not found' });
        }

        const employee = block.employee;
        const filename = `note-blocage-${employee.matricule}-${Date.now()}.docx`;
        const outputPath = path.join(__dirname, '../../temp', filename);

        // Ensure temp directory exists
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        await generateBlockNote(employee, block, outputPath);

        res.download(outputPath, filename, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            // Clean up the file after sending
            fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error('Error generating block note:', error);
        res.status(500).json({ error: 'Failed to generate block note' });
    }
});

/**
 * Generate unblock note PDF
 * GET /api/pdf/unblock/:blockId
 */
router.get('/unblock/:blockId', async (req, res) => {
    try {
        const { blockId } = req.params;

        const block = await prisma.block.findUnique({
            where: { id: blockId },
            include: {
                employee: true,
                admin: true,
                unblockedBy: true,
            },
        });

        if (!block) {
            return res.status(404).json({ error: 'Block not found' });
        }

        if (block.isActive) {
            return res.status(400).json({ error: 'Block is still active' });
        }

        const employee = block.employee;
        const filename = `note-deblocage-${employee.matricule}-${Date.now()}.docx`;
        const outputPath = path.join(__dirname, '../../temp', filename);

        // Ensure temp directory exists
        const tempDir = path.join(__dirname, '../../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        await generateUnblockNote(employee, block, outputPath);

        res.download(outputPath, filename, (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            // Clean up the file after sending
            fs.unlinkSync(outputPath);
        });
    } catch (error) {
        console.error('Error generating unblock note:', error);
        res.status(500).json({ error: 'Failed to generate unblock note' });
    }
});

module.exports = router;
