import { TestBed } from '@angular/core/testing';

import { ImageExportService } from './image-export.service';

describe('ImageExportService', () => {
  let service: ImageExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
