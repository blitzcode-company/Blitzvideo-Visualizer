import { TestBed } from '@angular/core/testing';

import { ModocineService } from './modocine.service';

describe('ModocineService', () => {
  let service: ModocineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModocineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
