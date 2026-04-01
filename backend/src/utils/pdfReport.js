import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { uploadToCloudinary } from './cloudinary.js';

export async function createPdfReport(text, notebookId) {
  const filename = `report_${notebookId}_${Date.now()}.pdf`;
  
  // Ensure we use a valid path for Windows/Unix
  const tmpDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
  }
  const outPath = path.join(tmpDir, filename);

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

          // Return Cloudinary Secure URL
          resolve(upload.secure_url || upload.url);
        } catch (err) {
          console.error("PDF Upload Error:", err);
          reject(err);
        }
      });

      stream.on('error', (err) => {
        console.error("Stream Error in PDF Report:", err);
        reject(err);
      });

    } catch (err) {
      console.error("Catch Error in PDF Report:", err);
      reject(err);
    }
  });
}
