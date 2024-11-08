import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import html2canvas from 'html2canvas';
import { HTML2CANVAS } from './app/services/image-export/html2canvas.token';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(withFetch()),
    { provide: HTML2CANVAS, useValue: html2canvas },
  ]
}).catch((err) => console.error(err));