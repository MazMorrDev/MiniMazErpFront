import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryPannel } from './inventory-pannel';

describe('Inventory', () => {
  let component: InventoryPannel;
  let fixture: ComponentFixture<InventoryPannel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryPannel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoryPannel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
