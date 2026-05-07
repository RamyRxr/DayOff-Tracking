const PizZip = require('pizzip');
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
            let docXml = zip.file('word/document.xml').asText();

            // Format dates
            const blockDate = new Date(block.createdAt);
            const repriseDate = new Date(blockDate);
            repriseDate.setDate(repriseDate.getDate() + 30);
            const formattedBlockDate = blockDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const formattedRepriseDate = repriseDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            // Replace name - BOURABA Sofiane -> FIRSTNAME Lastname
            docXml = docXml.replace(/BOURABA/g, employee.firstName.toUpperCase());
            docXml = docXml.replace(/Sofiane/g, employee.lastName);

            // Replace matricule
            docXml = docXml.replace(/12319U/g, employee.matricule);

            // Replace position - need to handle "Chef d'équipe  surveillance."
            // In XML it appears as "Chef d&apos;équipe" or "Chef d&#39;équipe"
            docXml = docXml.replace(/Chef d&apos;équipe/g, employee.position);
            docXml = docXml.replace(/Chef d&#39;équipe/g, employee.position);
            docXml = docXml.replace(/Chef/g, employee.position.split(' ')[0] || 'Chef');
            // Remove "surveillance." as it's part of the position template
            docXml = docXml.replace(/surveillance\./g, '');

            // Replace department (DAM -> actual department)
            // Department might be split across tags like: >D</w:t>...</w:t>AM<
            docXml = docXml.replace(/DAM/g, employee.department);
            // Handle split pattern
            docXml = docXml.replace(
                />D<\/w:t><\/w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" \/><w:lang w:val="en-US" \/><\/w:rPr><w:t xml:space="preserve">AM/g,
                `>${employee.department}<\/w:t><\/w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" \/><w:lang w:val="en-US" \/><\/w:rPr><w:t xml:space="preserve">`
            );

            // Replace motif text
            // Build motif: "Congé de maladie 30 jours a/c du 05/03/ 2026."
            // We'll replace "Congé de maladie" with block.reason
            // and "05/03/ 2026" with the actual block date
            if (block.reason) {
                // Replace individual words if needed
                const reasonWords = block.reason.split(' ');
                if (reasonWords.length >= 1 && reasonWords[0] !== 'Congé') {
                    docXml = docXml.replace(/Congé/g, reasonWords[0]);
                }
                if (reasonWords.length >= 2) {
                    docXml = docXml.replace(/maladie/g, reasonWords.slice(1).join(' '));
                }
            }

            // Replace the date in motif: "05/03/ 2026" -> actual block date
            docXml = docXml.replace(/05\/03\/ 2026/g, formattedBlockDate);
            docXml = docXml.replace(/05\/03\/2026/g, formattedBlockDate);

            // Replace reprise date: "04/04/2026" -> calculated reprise date
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
            const blockDate = new Date(block.createdAt);
            const unblockDate = new Date(block.unblockedAt);
            const formattedBlockDate = blockDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const formattedUnblockDate = unblockDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            // Replace name
            docXml = docXml.replace(/BOURABA/g, employee.firstName.toUpperCase());
            docXml = docXml.replace(/Sofiane/g, employee.lastName);

            // Replace matricule
            docXml = docXml.replace(/12319U/g, employee.matricule);

            // Replace position
            docXml = docXml.replace(/Chef d&apos;équipe/g, employee.position);
            docXml = docXml.replace(/Chef d&#39;équipe/g, employee.position);
            docXml = docXml.replace(/Chef/g, employee.position.split(' ')[0] || 'Chef');
            docXml = docXml.replace(/surveillance\./g, '');

            // Replace department (DEV -> actual department)
            docXml = docXml.replace(/DEV/g, employee.department);

            // Replace dates in motif text
            // "05/03/ 2026" -> block date
            docXml = docXml.replace(/05\/03\/ 2026/g, formattedBlockDate);
            docXml = docXml.replace(/05\/03\/2026/g, formattedBlockDate);

            // Replace reprise date: "04/04/2026" -> unblock date
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
