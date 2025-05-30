
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default class VisualPDFGenerator {
  async generateVisualPDF(analysisResult: any, companyName: string, position: string) {
    try {
      // Show loading state
      const loadingDiv = this.createLoadingIndicator();
      document.body.appendChild(loadingDiv);

      // Get the main analysis content container
      const contentElement = document.getElementById('analysis-content');
      if (!contentElement) {
        throw new Error('Analysis content not found');
      }

      // Create PDF with A4 dimensions
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);

      // Configure html2canvas options for high quality
      const canvasOptions = {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: true,
        height: contentElement.scrollHeight,
        width: contentElement.scrollWidth
      };

      // Capture the entire analysis content
      const canvas = await html2canvas(contentElement, canvasOptions);
      
      // Calculate dimensions for PDF
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If content is longer than one page, split it
      const maxHeightPerPage = pageHeight - (margin * 2);
      let yPosition = 0;
      let pageCount = 0;

      while (yPosition < imgHeight) {
        if (pageCount > 0) {
          pdf.addPage();
        }

        // Calculate the portion of image to include on this page
        const sourceY = (yPosition / imgHeight) * canvas.height;
        const sourceHeight = Math.min(
          (maxHeightPerPage / imgHeight) * canvas.height,
          canvas.height - sourceY
        );
        
        const actualHeight = Math.min(maxHeightPerPage, imgHeight - yPosition);

        // Create a temporary canvas for this page portion
        const pageCanvas = document.createElement('canvas');
        const pageCtx = pageCanvas.getContext('2d');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;

        if (pageCtx) {
          pageCtx.drawImage(
            canvas,
            0, sourceY, canvas.width, sourceHeight,
            0, 0, canvas.width, sourceHeight
          );

          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.9);
          pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, actualHeight);
        }

        yPosition += maxHeightPerPage;
        pageCount++;
      }

      // Add metadata
      pdf.setProperties({
        title: `CV Analysis - ${position} at ${companyName}`,
        subject: 'CV Compatibility Analysis Report',
        author: 'CV Analysis Tool',
        creator: 'CV Analysis Platform'
      });

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `CV-Analysis-${companyName.replace(/[^a-zA-Z0-9]/g, '-')}-${position.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.pdf`;

      // Download the PDF
      pdf.save(fileName);

      // Remove loading indicator
      document.body.removeChild(loadingDiv);

      console.log('Visual PDF generated successfully');

    } catch (error) {
      console.error('Error generating visual PDF:', error);
      
      // Remove loading indicator if it exists
      const loadingDiv = document.querySelector('.pdf-loading');
      if (loadingDiv) {
        document.body.removeChild(loadingDiv);
      }
      
      // Fallback to basic PDF or show error
      alert('Failed to generate visual PDF. The content may be too large or complex.');
    }
  }

  private createLoadingIndicator(): HTMLElement {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'pdf-loading';
    loadingDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
    `;

    loadingDiv.innerHTML = `
      <div style="
        width: 50px;
        height: 50px;
        border: 4px solid #ffffff30;
        border-top: 4px solid #ffffff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      "></div>
      <h3 style="margin: 0 0 10px 0; font-size: 18px;">Generating Visual PDF</h3>
      <p style="margin: 0; font-size: 14px; opacity: 0.8;">Capturing analysis content...</p>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    return loadingDiv;
  }
}
