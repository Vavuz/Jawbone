import { InjectionToken } from '@angular/core';
import html2canvas from 'html2canvas';

export const HTML2CANVAS = new InjectionToken<typeof html2canvas>('html2canvas', {
  providedIn: 'root',
  factory: () => html2canvas
});