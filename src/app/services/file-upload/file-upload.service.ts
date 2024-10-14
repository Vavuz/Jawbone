import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor() { }

  readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      let fileReader: FileReader = new FileReader();
      fileReader.onloadend = () => {
        if (fileReader.result) {
          resolve(fileReader.result.toString());
        } else {
          reject('File could not be read');
        }
      };
      fileReader.readAsText(file);
    });
  }
}
