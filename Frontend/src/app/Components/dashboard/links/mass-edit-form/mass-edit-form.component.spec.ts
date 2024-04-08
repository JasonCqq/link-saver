import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MassEditFormComponent } from './mass-edit-form.component';

describe('MassEditFormComponent', () => {
  let component: MassEditFormComponent;
  let fixture: ComponentFixture<MassEditFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MassEditFormComponent]
    });
    fixture = TestBed.createComponent(MassEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
