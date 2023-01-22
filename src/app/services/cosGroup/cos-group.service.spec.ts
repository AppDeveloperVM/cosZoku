import { TestBed } from '@angular/core/testing';

import { CosGroupService } from './cos-group.service';

describe('CosGroupService', () => {
  let service: CosGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CosGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
