import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TareasList } from './tareas-list';

describe('TareasList', () => {
  let component: TareasList;
  let fixture: ComponentFixture<TareasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TareasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TareasList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
