import { TestBed } from '@angular/core/testing';
import { FileUploadService } from './file-upload.service';

describe('FileUploadService', () => {
  let service: FileUploadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileUploadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should read and parse a .jaw file as JSON', async () => {
    const fileContent = JSON.stringify({ key: 'value' });
    const file = new File([fileContent], 'test.jaw', { type: 'application/json' });

    const result = await service.readFile(file);
    expect(result).toEqual({ key: 'value' });
  });

  it('should read a plain text file', async () => {
    const fileContent = 'Plain text content';
    const file = new File([fileContent], 'test.txt', { type: 'text/plain' });

    const result = await service.readFile(file);
    expect(result).toBe(fileContent);
  });

  it('should reject with an error if JSON parsing fails for .jaw file', async () => {
    const invalidJsonContent = '{ key: value }'; // Invalid JSON
    const file = new File([invalidJsonContent], 'test.jaw', { type: 'application/json' });

    try {
      await service.readFile(file);
      fail('Expected error was not thrown');
    } catch (error) {
      expect(error).toContain('Error parsing file');
    }
  });

  it('should reject with an error if file reading fails', async () => {
    const file = new File([''], 'test.txt', { type: 'text/plain' });

    spyOn(FileReader.prototype, 'readAsText').and.callFake(function (this: FileReader) {
      if (this.onerror) {
        this.onerror(new ProgressEvent('error') as ProgressEvent<FileReader>);
      }
    });

    try {
      await service.readFile(file);
      fail('Expected error was not thrown');
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});