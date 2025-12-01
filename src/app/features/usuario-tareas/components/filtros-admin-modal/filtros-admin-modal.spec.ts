import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosAdminModal } from './filtros-admin-modal';

describe('FiltrosAdminModal', () => {
  let component: FiltrosAdminModal;
  let fixture: ComponentFixture<FiltrosAdminModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FiltrosAdminModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltrosAdminModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
