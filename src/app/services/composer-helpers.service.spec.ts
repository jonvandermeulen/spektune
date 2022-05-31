import { TestBed } from '@angular/core/testing';

import { ComposerHelpersService } from './composer-helpers.service';

describe('ComposerHelpersService', () => {
  let service: ComposerHelpersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComposerHelpersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
