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
            const formattedRepriseDate = repriseDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            // Replace BOURABA (in its own tag)
            docXml = docXml.replace(/>BOURABA</g, `>${employee.firstName.toUpperCase()}<`);

            // Replace Sofiane (in its own tag)
            docXml = docXml.replace(/>Sofiane</g, `>${employee.lastName}<`);

            // Replace 12319U (in its own tag)
            docXml = docXml.replace(/>12319U</g, `>${employee.matricule}<`);

            // Replace position - handle the apostrophe encoding
            docXml = docXml.replace(/>Chef d&apos;équipe</g, `>${employee.position.split(' ').slice(0, 2).join(' ')}<`);
            docXml = docXml.replace(/>surveillance\.</g, `>${employee.position.split(' ').slice(2).join(' ')}<`);

            // Replace DAM - handle split across tags (D in one tag, AM in another)
            // Pattern: >D</w:t></w:r><w:r>...<w:t ...>AM<
            docXml = docXml.replace(
                />D<\/w:t><\/w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" \/><w:lang w:val="en-US" \/><\/w:rPr><w:t xml:space="preserve">AM</g,
                `>${employee.department}<\/w:t><\/w:r><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" \/><w:lang w:val="en-US" \/><\/w:rPr><w:t xml:space="preserve">`
            );

            // Replace the motif text (it's also split across tags)
            const motifText = `${block.reason}${block.description ? ' - ' + block.description : ''}`;

            // Replace pieces of "Congé de maladie 30 jours a/c du 05/03/ 2026."
            docXml = docXml.replace(/>Congé</g, `>${motifText.split(' ')[0] || 'Congé'}<`);

            // Simplified: just replace key parts
            docXml = docXml.replace(/>maladie</g, `>${motifText.substring(6).substring(0, 20)}<`);

            // Replace reprise date (in its own tag)
            docXml = docXml.replace(/>04\/04\/2026\.</g, `>${formattedRepriseDate}.<`);

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
            const formattedUnblockDate = unblockDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });

            // Replace BOURABA
            docXml = docXml.replace(/>BOURABA</g, `>${employee.firstName.toUpperCase()}<`);

            // Replace Sofiane
            docXml = docXml.replace(/>Sofiane</g, `>${employee.lastName}<`);

            // Replace 12319U
            docXml = docXml.replace(/>12319U</g, `>${employee.matricule}<`);

            // Replace position
            docXml = docXml.replace(/>Chef d&apos;équipe</g, `>${employee.position.split(' ').slice(0, 2).join(' ')}<`);
            docXml = docXml.replace(/>surveillance\.</g, `>${employee.position.split(' ').slice(2).join(' ')}<`);

            // Replace DEV (might be split like DAM)
            docXml = docXml.replace(/>DEV</g, `>${employee.department}<`);

            // Replace reprise date
            docXml = docXml.replace(/>04\/04\/2026\.</g, `>${formattedUnblockDate}.<`);
            docXml = docXml.replace(/>04\/04\/2026</g, `>${formattedUnblockDate}<`);

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
