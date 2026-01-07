import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMovementDialog } from './create-movement-dialog';

describe('CreateMovementDialog', () => {
  let component: CreateMovementDialog;
  let fixture: ComponentFixture<CreateMovementDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMovementDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMovementDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
