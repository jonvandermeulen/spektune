import { TestBed } from '@angular/core/testing';

import { SoundfontService } from './soundfont.service';

describe('SoundfontService', () => {
  let service: SoundfontService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundfontService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
