import { Injectable } from '@angular/core';
import  moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class TiempoService {



  tiempoTranscurrido(fecha: Date | string): string {
    return moment(fecha).fromNow();
  }

}
