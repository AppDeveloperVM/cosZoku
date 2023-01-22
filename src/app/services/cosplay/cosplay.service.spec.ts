import { TestBed } from '@angular/core/testing';

import { CosplayService } from './cosplay.service';

describe('CosplayService', () => {
  let service: CosplayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CosplayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
