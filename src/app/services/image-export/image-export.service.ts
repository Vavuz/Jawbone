import { Injectable, Inject } from '@angular/core';
import cytoscape from 'cytoscape';
import { HTML2CANVAS } from './html2canvas.token';
import { Options } from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class ImageExportService {
  private cy?: cytoscape.Core;

  constructor(
    @Inject(HTML2CANVAS) private html2canvasFn: (element: HTMLElement, options?: Options) => Promise<HTMLCanvasElement>
  ) {}

  setCytoscapeInstance(cy?: cytoscape.Core) {
    this.cy = cy;
  }

  async exportDiagramAsImage(elementId: string, filename: string = 'diagram', scaleFactor: number = 3) {
    const element = document.getElementById(elementId);
    if (!element || !this.cy) {
      console.error('Element or Cytoscape instance not found');
      return;
    }

    const initialViewport = {
      pan: { ...this.cy.pan() },
      zoom: this.cy.zoom()
    };

    const boundingBox = this.cy.elements().boundingBox();
    const diagramCenter = {
      x: (boundingBox.x1 + boundingBox.x2) / 2,
      y: (boundingBox.y1 + boundingBox.y2) / 2,
    };

    const diagramWidth = boundingBox.w;
    const diagramHeight = boundingBox.h;
    const viewportWidth = this.cy.width();
    const viewportHeight = this.cy.height();

    const viewportArea = viewportWidth * viewportHeight;
    const diagramArea = diagramWidth * diagramHeight;
    const sizeRatio = diagramArea / viewportArea;

    // Larger diagrams get less zoom-out
    const zoomOutFactor = sizeRatio > 1 ? 0.90 : 0.8 - Math.min(sizeRatio * 0.2, 0.15);
    const fitScale = Math.min(viewportWidth / diagramWidth, viewportHeight / diagramHeight) * zoomOutFactor;

    try {
      this.cy.zoom(fitScale);
      this.cy.pan({
        x: viewportWidth / 2 - diagramCenter.x * fitScale,
        y: viewportHeight / 2 - diagramCenter.y * fitScale
      });

      // Allow the layout to update
      await new Promise((resolve) => setTimeout(resolve, 200));

      const canvas = await this.html2canvasFn(element, {
        scale: scaleFactor,
        useCORS: true,
      } as Options);      

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${filename}.png`;
      link.click();
    } catch (error) {
      console.error('Error exporting diagram as PNG:', error);
    } finally {
      this.cy.viewport(initialViewport);
    }
  }
}

export { HTML2CANVAS };
