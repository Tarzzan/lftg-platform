// @ts-nocheck
import { Injectable } from '@nestjs/common';
import PDFDocument from "pdfkit";

@Injectable()
export class AdvancedReportsService {
  async generateCitesReport(): Promise<Buffer> {
    const pdfBuffer: Buffer = await new Promise(resolve => {
      const doc = new PDFDocument();
      doc.text('Rapport CITES', { align: 'center' });
      doc.moveDown();
      doc.text('Animaux CITES actuellement dans la ferme :');
      doc.moveDown();
      doc.text('- Ara macao (Annexe I)');
      doc.text('- Dendrobates azureus (Annexe II)');
      doc.end();

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
    });
    return pdfBuffer;
  }

  async generateAnnualReport(year: number): Promise<Buffer> {
    const pdfBuffer: Buffer = await new Promise(resolve => {
      const doc = new PDFDocument();
      doc.text(`Rapport Annuel ${year}`, { align: 'center' });
      doc.moveDown();
      doc.text(`Résumé des activités de l'année ${year}.`);
      doc.moveDown();
      doc.text('Naissances: 12');
      doc.text('Décès: 3');
      doc.text('Acquisitions: 5');
      doc.text('Transferts: 2');
      doc.end();

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
    });
    return pdfBuffer;
  }
}
