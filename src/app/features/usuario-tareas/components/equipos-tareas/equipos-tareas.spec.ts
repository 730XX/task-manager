import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquiposTareas } from './equipos-tareas';

describe('EquiposTareas', () => {
  let component: EquiposTareas;
  let fixture: ComponentFixture<EquiposTareas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EquiposTareas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquiposTareas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
