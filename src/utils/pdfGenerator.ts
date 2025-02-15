import html2pdf from 'html2pdf.js';
import { Project } from '../data/projects';

export const generateProjectPDF = (
  project: Project,
  costs: {
    overhead: number;
    profit: number;
    profitMargin: number;
  }
) => {
  console.log("generateProjectPDF function called");

  // Create HTML content (same as before)
  const content = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #333; margin-bottom: 20px;">${project.name}</h1>
      <div style="margin-bottom: 20px;">
        <p style="color: #666;">${project.description}</p>
      </div>
      <div style="margin-bottom: 20px;">
        <h2 style="color: #444; font-size: 18px;">Project Details</h2>
        <p><strong>Status:</strong> ${project.status}</p>
        <p><strong>Duration:</strong> ${project.durationInWeeks} weeks</p>
        <p><strong>Start Date:</strong> ${project.startDate}</p>
        <p><strong>End Date:</strong> ${project.endDate}</p>
      </div>
      <div style="margin-bottom: 20px;">
        <h2 style="color: #444; font-size: 18px;">Financial Summary</h2>
        <p><strong>Total Price:</strong> $${project.price.toFixed(2)}</p>
        <p><strong>Overhead Costs:</strong> $${costs.overhead.toFixed(2)}</p>
        <p><strong>Profit:</strong> $${costs.profit.toFixed(2)}</p>
        <p><strong>Profit Margin:</strong> ${costs.profitMargin.toFixed(1)}%</p>
      </div>
      <div style="margin-bottom: 20px;">
        <h2 style="color: #444; font-size: 18px;">Overhead Allocation</h2>
        <p><strong>Allocation Percentage:</strong> ${project.overheadAllocationPercentage}%</p>
      </div>
      <div style="margin-top: 40px; font-size: 12px; color: #666;">
        Generated on ${new Date().toLocaleDateString()}
      </div>
    </div>
  `;

  // Configure PDF options (same as before)
  const opt = {
    margin: 1,
    filename: `${project.name.toLowerCase().replace(/\s+/g, '-')}-details.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Generate PDF as Blob and trigger download
  const element = document.createElement('div');
  element.innerHTML = content;

  console.log("HTML content created:", content);

  html2pdf()
    .set(opt)
    .from(element)
    .outputPdfObject() // Output as PdfObject
    .then((pdfObject) => {
      const pdfBlob = pdfObject.output('blob'); // Convert PdfObject to Blob
      const pdfUrl = URL.createObjectURL(pdfBlob); // Create URL for Blob
      const downloadLink = document.createElement('a'); // Create a link
      downloadLink.href = pdfUrl;
      downloadLink.download = opt.filename; // Set filename
      document.body.appendChild(downloadLink); // Append to body
      downloadLink.click(); // Programmatically click
      document.body.removeChild(downloadLink); // Remove from body
      URL.revokeObjectURL(pdfUrl); // RevokeObjectURL
      console.log("PDF download triggered successfully"); // Log success
    })
    .catch(error => {
      console.error("PDF generation error:", error); // Log errors
    });
};
