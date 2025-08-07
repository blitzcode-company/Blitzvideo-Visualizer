import { TestBed } from '@angular/core/testing';

import { ChatstreamService } from './chatstream.service';

describe('ChatstreamService', () => {
  let service: ChatstreamService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatstreamService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
