import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'chunkPipe'
})
export class ChunkPipe implements PipeTransform {
  transform(value: any[], chunkSize: number): any[] {
    const chunks = [];
    let i = 0;
    while (i < value.length) {
      chunks.push(value.slice(i, i + chunkSize));
      i += chunkSize;
    }
    return chunks;
  }
}
