import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateProductDialog } from './update-product-dialog';

describe('AddProductDialog', () => {
  let component: UpdateProductDialog;
  let fixture: ComponentFixture<UpdateProductDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateProductDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateProductDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
