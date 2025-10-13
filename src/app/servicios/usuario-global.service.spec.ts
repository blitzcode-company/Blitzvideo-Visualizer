import { TestBed } from '@angular/core/testing';

import { UsuarioGlobalService } from './usuario-global.service';

describe('UsuarioGlobalService', () => {
  let service: UsuarioGlobalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsuarioGlobalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
