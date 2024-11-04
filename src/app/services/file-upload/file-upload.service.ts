import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  async readFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const content = reader.result as string;
          if (file.name.endsWith('.jaw')) {
            resolve(JSON.parse(content));
          } else {
            resolve(content);
          }
        } catch (error) {
          reject(`Error parsing file: ${error}`);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }
}