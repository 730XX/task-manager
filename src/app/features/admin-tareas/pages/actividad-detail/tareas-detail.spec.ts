import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TareasDetail } from './tareas-detail';

describe('TareasDetail', () => {
  let component: TareasDetail;
  let fixture: ComponentFixture<TareasDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TareasDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TareasDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
