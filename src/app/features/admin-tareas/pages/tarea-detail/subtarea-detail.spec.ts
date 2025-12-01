import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtareaDetail } from './subtarea-detail';

describe('SubtareaDetail', () => {
  let component: SubtareaDetail;
  let fixture: ComponentFixture<SubtareaDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubtareaDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtareaDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
