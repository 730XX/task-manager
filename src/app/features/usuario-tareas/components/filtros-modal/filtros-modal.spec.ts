import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosModal } from './filtros-modal';

describe('FiltrosModal', () => {
  let component: FiltrosModal;
  let fixture: ComponentFixture<FiltrosModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FiltrosModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltrosModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
