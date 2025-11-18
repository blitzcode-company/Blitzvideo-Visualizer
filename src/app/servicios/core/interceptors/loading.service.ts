import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingBarService } from '../../loading-bar.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingBarService: LoadingBarService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Excluimos peticiones que no queremos que activen la barra
    if (req.url.includes('pusher') || req.url.includes('echo') || req.url.includes('.json')) {
      return next.handle(req);
    }

    if (this.activeRequests === 0) {
      this.loadingBarService.start();
    }
    this.activeRequests++;

    return next.handle(req).pipe(
      finalize(() => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.loadingBarService.complete();
        }
      })
    );
  }
}