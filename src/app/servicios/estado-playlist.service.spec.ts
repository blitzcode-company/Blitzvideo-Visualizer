import { TestBed } from '@angular/core/testing';

import { EstadoPlaylistService } from './estado-playlist.service';

describe('EstadoPlaylistService', () => {
  let service: EstadoPlaylistService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadoPlaylistService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
