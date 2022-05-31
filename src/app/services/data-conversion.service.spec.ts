import { TestBed } from '@angular/core/testing';

import { DataConversionService } from './data-conversion.service';

describe('DataConversionService', () => {
  let service: DataConversionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataConversionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
