import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { uploadToCloudinary } from './cloudinary.js';

export async function createPdfReport(text, notebookId) {
  const filename = `report_${notebookId}_${Date.now()}.pdf`;
  const outPath = path.join('/tmp', filename);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(outPath);

      doc.pipe(stream);
      doc.fontSize(16).text('NotebookLM Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(text);
      doc.end();

      stream.on('finish', async () => {
        try {
          // Upload the PDF to Cloudinary
          const upload = await uploadToCloudinary(outPath, 'reports');

          // Optionally remove local PDF file
          if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

          // Return Cloudinary URL
          resolve(upload.url);
        } catch (err) {
          reject(err);
        }
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (err) {
      reject(err);
    }
  });
}
