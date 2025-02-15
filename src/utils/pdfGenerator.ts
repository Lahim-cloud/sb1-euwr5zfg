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
  // Create HTML content
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

  // Configure PDF options
  const opt = {
    margin: 1,
    filename: `${project.name.toLowerCase().replace(/\s+/g, '-')}-details.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // Generate PDF
  const element = document.createElement('div');
  element.innerHTML = content;
  
  html2pdf().set(opt).from(element).save();
};
