import { TestBed } from '@angular/core/testing';

import { PuntuacionesService } from './puntuaciones.service';

describe('PuntuacionesService', () => {
  let service: PuntuacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PuntuacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
