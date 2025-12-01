import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearReapertura } from './crear-reapertura';

describe('CrearReapertura', () => {
  let component: CrearReapertura;
  let fixture: ComponentFixture<CrearReapertura>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrearReapertura]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearReapertura);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
