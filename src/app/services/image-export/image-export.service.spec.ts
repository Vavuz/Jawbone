import { TestBed } from '@angular/core/testing';
import { ImageExportService, HTML2CANVAS } from './image-export.service';
import cytoscape from 'cytoscape';

describe('ImageExportService', () => {
  let service: ImageExportService;
  let mockCytoscapeInstance: any;
  const mockElementId = 'test-element';
  const mockFilename = 'test-diagram';
  let mockHtml2canvas: jasmine.Spy;

  beforeEach(() => {
    mockHtml2canvas = jasmine.createSpy('html2canvas');

    TestBed.configureTestingModule({
      providers: [
        ImageExportService,
        { provide: HTML2CANVAS, useValue: mockHtml2canvas },
      ],
    });

    service = TestBed.inject(ImageExportService);

    mockCytoscapeInstance = {
      pan: jasmine.createSpy('pan').and.returnValue({ x: 50, y: 50 }),
      zoom: jasmine.createSpy('zoom').and.returnValue(1.5),
      elements: jasmine.createSpy('elements').and.returnValue({
        boundingBox: jasmine.createSpy('boundingBox').and.returnValue({
          x1: 0,
          y1: 0,
          x2: 100,
          y2: 100,
          w: 100,
          h: 100,
        }),
      }),
      viewport: jasmine.createSpy('viewport'),
      width: jasmine.createSpy('width').and.returnValue(800),
      height: jasmine.createSpy('height').and.returnValue(600),
    };
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the Cytoscape instance', () => {
    service.setCytoscapeInstance(mockCytoscapeInstance);
    expect((service as any).cy).toBe(mockCytoscapeInstance);
  });

  it('should trigger image download', async () => {
    const mockElement = {} as HTMLElement;

    spyOn(document, 'getElementById').and.returnValue(mockElement);

    service.setCytoscapeInstance(mockCytoscapeInstance);

    const mockBoundingBox = {
      x1: 0,
      y1: 0,
      x2: 100,
      y2: 100,
      w: 100,
      h: 100,
    };
    mockCytoscapeInstance.elements.and.returnValue({
      boundingBox: jasmine.createSpy('boundingBox').and.returnValue(mockBoundingBox),
    });

    const mockCanvas = {
      toDataURL: jasmine.createSpy('toDataURL').and.returnValue('data:image/png;base64,mockImageData'),
    } as unknown as HTMLCanvasElement;
    mockHtml2canvas.and.returnValue(Promise.resolve(mockCanvas));

    const originalCreateElement = document.createElement.bind(document);
    spyOn(document, 'createElement').and.callFake((tagName: string) => {
      if (tagName === 'a') {
        return jasmine.createSpyObj('a', ['click']);
      } else if (tagName === 'style') {
        return originalCreateElement(tagName);
      }
      return originalCreateElement(tagName);
    });

    await service.exportDiagramAsImage(mockElementId, mockFilename);

    expect(mockHtml2canvas).toHaveBeenCalledWith(mockElement, jasmine.objectContaining({ scale: 3, useCORS: true }));

    const createElementSpy = (document.createElement as jasmine.Spy);
    expect(createElementSpy).toHaveBeenCalledWith('a');

    const aCall = createElementSpy.calls.all().find(call => call.args[0] === 'a');
    expect(aCall).toBeDefined();

    const mockAnchor = aCall?.returnValue as jasmine.SpyObj<HTMLAnchorElement>;
    expect(mockAnchor.href).toBe('data:image/png;base64,mockImageData');
    expect(mockAnchor.download).toBe(`${mockFilename}.png`);
    expect(mockAnchor.click).toHaveBeenCalled();
  });
});