import { TestBed } from '@angular/core/testing';

import { MovementsService } from './movements.service';

describe('Movements', () => {
  let service: MovementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
