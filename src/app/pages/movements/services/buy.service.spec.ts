import { TestBed } from '@angular/core/testing';

import { BuyService } from './buy.service';

describe('Buy', () => {
  let service: BuyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
