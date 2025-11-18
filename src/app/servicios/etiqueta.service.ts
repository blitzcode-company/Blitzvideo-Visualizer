import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment.prod';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class EtiquetaService {

  constructor(private httpClient: HttpClient) { }

  private apiUrl = environment.apiUrl

  
  listarEtiquetas(): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    const url = `${this.apiUrl}api/v1/etiquetas/popular`
    return this.httpClient.get<any[]>(url, httpOptions);
  }
  

}
