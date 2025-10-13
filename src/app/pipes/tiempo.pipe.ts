import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempo'
  
})
export class TiempoPipe implements PipeTransform {

  transform(value: string | Date): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'hace unos segundos';
    if (minutes < 60) return `hace ${minutes} min`;
    if (hours < 24) return `hace ${hours} h`;
    if (days === 1) return 'ayer';
    if (days < 30) return `hace ${days} días`;

    const months = Math.floor(days / 30);
    if (months < 12) return `hace ${months} meses`;

    const years = Math.floor(months / 12);
    return `hace ${years} años`;
  }

}
