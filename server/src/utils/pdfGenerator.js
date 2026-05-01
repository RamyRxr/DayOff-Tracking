const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a block note PDF matching the official NAFTAL format
 */
function generateBlockNote(employee, block, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: 72,
                    bottom: 72,
                    left: 72,
                    right: 72
                }
            });

            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Header - NAFTAL branding
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .text('BRANCHE GPL', 72, 100)
                .font('Helvetica')
                .text('Direction Administration & Moyens', 72, 115)
                .text('Département Gestion du Personnel', 72, 130)
                .text('Service prestations sociales', 72, 145);

            // Date (top right)
            const blockDate = new Date(block.createdAt);
            const formattedDate = blockDate.toLocaleDateString('fr-DZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            doc.text(`Mohammedia, le ${formattedDate}`, 400, 100, { align: 'right' });

            // Title
            doc.fontSize(18)
                .font('Helvetica-Bold')
                .text('NOTE DE BLOCAGE DE SALAIRE', 72, 220, { align: 'center' });

            // Subtitle
            doc.fontSize(14)
                .text('A SERVICE PAIE', 72, 280, { align: 'center' });

            // Body
            doc.fontSize(11)
                .font('Helvetica')
                .text('Nous vous demandons de bien vouloir bloquer, le Salaire de', 72, 340);

            // Employee details
            const employeeName = `${employee.firstName} ${employee.lastName}`.toUpperCase();
            const yStart = 380;
            const lineHeight = 25;

            doc.font('Helvetica-Bold')
                .text('Mr.', 72, yStart, { continued: true, width: 200 })
                .font('Helvetica')
                .text(`: ${employeeName}`, { width: 400 });

            doc.font('Helvetica-Bold')
                .text('Matricule', 72, yStart + lineHeight, { continued: true, width: 200 })
                .font('Helvetica')
                .text(`: ${employee.matricule}`, { width: 400 });

            doc.font('Helvetica-Bold')
                .text('Employée en qualité de', 72, yStart + lineHeight * 2, { continued: true, width: 200 })
                .font('Helvetica')
                .text(`: ${employee.position}`, { width: 400 });

            doc.font('Helvetica-Bold')
                .text('Au sein de la direction', 72, yStart + lineHeight * 3, { continued: true, width: 200 })
                .font('Helvetica')
                .text(`: ${employee.department}`, { width: 400 });

            doc.font('Helvetica-Bold')
                .text('Pour motif suivant', 72, yStart + lineHeight * 4, { continued: true, width: 200 })
                .font('Helvetica')
                .text(`: ${block.reason}${block.description ? ' - ' + block.description : ''}`, { width: 400 });

            // Reprise date (calculated as 30 days after block date)
            const repriseDate = new Date(blockDate);
            repriseDate.setDate(repriseDate.getDate() + 30);
            const formattedReprise = repriseDate.toLocaleDateString('fr-DZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            doc.font('Helvetica-Bold')
                .text(`Reprise : le ${formattedReprise}.`, 72, yStart + lineHeight * 5.5);

            // Footer
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .text('LE CHEF DE SERVICE', 72, 650)
                .text('PRESTATIONS SOCIALES', 72, 665);

            doc.end();

            stream.on('finish', () => resolve(outputPath));
            stream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Generate an unblock note PDF matching the official NAFTAL format
 */
function generateUnblockNote(employee, block, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margins: {
                    top: 72,
                    bottom: 72,
                    left: 72,
                    right: 72
                }
            });

            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);

            // Header - NAFTAL branding
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .text('BRANCHE GPL', 72, 100)
                .font('Helvetica')
                .text('Direction Administration & Moyens', 72, 115)
                .text('Département Gestion du Personnel', 72, 130)
                .text('Service prestations sociales', 72, 145);

            // Date (top right)
            const unblockDate = new Date(block.unblockedAt);
            const formattedDate = unblockDate.toLocaleDateString('fr-DZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            doc.text(`Mohammedia, le ${formattedDate}`, 400, 100, { align: 'right' });

            // Title
            doc.fontSize(18)
                .font('Helvetica-Bold')
                .text('NOTE DE DEBLOCAGE DE SALAIRE', 72, 220, { align: 'center' });

            // Subtitle
            doc.fontSize(14)
                .text('A SERVICE PAIE', 72, 280, { align: 'center' });

            // Body
            doc.fontSize(11)
                .font('Helvetica')
                .text('Nous vous demandons de bien vouloir débloquer, le Salaire de', 72, 340);

            // Employee details
            const employeeName = `${employee.firstName} ${employee.lastName}`.toUpperCase();
            const yStart = 380;
            const lineHeight = 25;

            doc.font('Helvetica-Bold')
                .text('Mr.', 72, yStart, { continued: true, width: 200 })
                .font('Helvetica')
                .text(`: ${employeeName}`, { width: 400 });

            doc.font('Helvetica-Bold')
                .text('Matricule', 72, yStart + lineHeight, { continued: true, width: 200 })
                .font('Helvetica')
                .text(`: ${employee.matricule}`, { width: 400 });

            doc.font('Helvetica-Bold')
                .text('Employée en qualité de', 72, yStart + lineHeight * 2, { continued: true, width: 200 })
                .font('Helvetica')
                .text(`: ${employee.position}`, { width: 400 });

            doc.font('Helvetica-Bold')
                .text('Au sein de la direction', 72, yStart + lineHeight * 3, { continued: true, width: 200 })
                .font('Helvetica')
                .text(`: ${employee.department}`, { width: 400 });

            // Unblock reason
            const unblockReason = block.unblockReason || 'Reprise à l\'issue d\'un congé';
            doc.font('Helvetica-Bold')
                .text('Pour motif suivant', 72, yStart + lineHeight * 4, { continued: true, width: 200 })
                .font('Helvetica')
                .text(`: ${unblockReason}${block.unblockDescription ? ' - ' + block.unblockDescription : ''}`, { width: 400 });

            // Reprise date
            const formattedReprise = unblockDate.toLocaleDateString('fr-DZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            doc.font('Helvetica-Bold')
                .text(`Reprise-le : ${formattedReprise}`, 72, yStart + lineHeight * 5.5);

            // Footer
            doc.fontSize(10)
                .font('Helvetica-Bold')
                .text('LE SERVICE', 72, 650)
                .text('PRESTATIONS SOCIALES', 72, 665);

            doc.end();

            stream.on('finish', () => resolve(outputPath));
            stream.on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateBlockNote,
    generateUnblockNote,
};
