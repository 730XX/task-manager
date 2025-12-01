import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TareaFormModal } from './tarea-form-modal';

describe('TareaFormModal', () => {
  let component: TareaFormModal;
  let fixture: ComponentFixture<TareaFormModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TareaFormModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TareaFormModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
