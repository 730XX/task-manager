import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtareasList } from './subtareas-list';

describe('SubtareasList', () => {
  let component: SubtareasList;
  let fixture: ComponentFixture<SubtareasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubtareasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtareasList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
