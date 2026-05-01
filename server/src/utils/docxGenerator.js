const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const fs = require('fs');
const path = require('path');

/**
 * Generate a block note DOCX by replacing content in template
 */
function generateBlockNote(employee, block, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            // Read template file
            const templatePath = path.join(__dirname, '../../../block.docx');
            const content = fs.readFileSync(templatePath, 'binary');

            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });

            // Format dates
            const blockDate = new Date(block.createdAt);
            const formattedBlockDate = blockDate.toLocaleDateString('fr-DZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            // Calculate reprise date (30 days after block)
            const repriseDate = new Date(blockDate);
            repriseDate.setDate(repriseDate.getDate() + 30);
            const formattedRepriseDate = repriseDate.toLocaleDateString('fr-DZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            // Prepare data for replacement
            const employeeName = `${employee.firstName} ${employee.lastName}`.toUpperCase();

            // Set template variables
            doc.setData({
                employeeName: employeeName,
                matricule: employee.matricule,
                position: employee.position,
                department: employee.department,
                blockReason: block.reason + (block.description ? ` ${block.description}` : ''),
                blockDate: formattedBlockDate,
                repriseDate: formattedRepriseDate,
            });

            try {
                doc.render();
            } catch (error) {
                console.error('Error rendering document:', error);
                // If template rendering fails, use direct text replacement
                return generateBlockNoteDirectReplace(employee, block, outputPath, content)
                    .then(resolve)
                    .catch(reject);
            }

            const buf = doc.getZip().generate({ type: 'nodebuffer' });
            fs.writeFileSync(outputPath, buf);
            resolve(outputPath);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Fallback: Direct text replacement in DOCX XML
 */
function generateBlockNoteDirectReplace(employee, block, outputPath, templateContent) {
    return new Promise((resolve, reject) => {
        try {
            const zip = new PizZip(templateContent);

            // Read the main document XML
            let docXml = zip.file('word/document.xml').asText();

            // Format dates
            const blockDate = new Date(block.createdAt);
            const formattedBlockDate = blockDate.toLocaleDateString('fr-DZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const repriseDate = new Date(blockDate);
            repriseDate.setDate(repriseDate.getDate() + 30);
            const formattedRepriseDate = repriseDate.toLocaleDateString('fr-DZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const employeeName = `${employee.firstName} ${employee.lastName}`.toUpperCase();

            // Replace placeholder values from template
            docXml = docXml.replace(/BOURABA\s+Sofiane/g, employeeName);
            docXml = docXml.replace(/12319U/g, employee.matricule);
            docXml = docXml.replace(/Chef d'équipe surveillance\./g, employee.position);
            docXml = docXml.replace(/DAM/g, employee.department);

            // Replace the motif
            const motifText = block.reason + (block.description ? ` ${block.description}` : '');
            docXml = docXml.replace(/Congé de maladie 30 jours a\/c du 05\/03\/2026\./g, motifText);

            // Replace dates
            docXml = docXml.replace(/04\/04\/2026/g, formattedRepriseDate);

            // Update the document XML
            zip.file('word/document.xml', docXml);

            // Generate the new DOCX
            const buf = zip.generate({ type: 'nodebuffer' });
            fs.writeFileSync(outputPath, buf);
            resolve(outputPath);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Generate an unblock note DOCX by replacing content in template
 */
function generateUnblockNote(employee, block, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            // Read template file
            const templatePath = path.join(__dirname, '../../../unblock.docx');
            const content = fs.readFileSync(templatePath, 'binary');

            const zip = new PizZip(content);
            let docXml = zip.file('word/document.xml').asText();

            // Format dates
            const unblockDate = new Date(block.unblockedAt);
            const formattedUnblockDate = unblockDate.toLocaleDateString('fr-DZ', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            const employeeName = `${employee.firstName} ${employee.lastName}`.toUpperCase();
            const unblockReason = block.unblockReason || "Reprise à l'issue d'un congé";

            // Replace placeholder values from template
            docXml = docXml.replace(/BOURABA\s+Sofiane/g, employeeName);
            docXml = docXml.replace(/12319U/g, employee.matricule);
            docXml = docXml.replace(/Chef d'équipe surveillance\./g, employee.position);
            docXml = docXml.replace(/DEV/g, employee.department);

            // Replace the unblock motif
            const motifText = unblockReason + (block.unblockDescription ? ` ${block.unblockDescription}` : '');
            docXml = docXml.replace(/Reprise\s+à\s+l'issue d'un congé de maladie 30 jours A\/C\s+du 05\/03\/2026\./g, motifText);

            // Replace dates
            docXml = docXml.replace(/04\/04\/2026/g, formattedUnblockDate);

            // Update the document XML
            zip.file('word/document.xml', docXml);

            // Generate the new DOCX
            const buf = zip.generate({ type: 'nodebuffer' });
            fs.writeFileSync(outputPath, buf);
            resolve(outputPath);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    generateBlockNote,
    generateUnblockNote,
};
