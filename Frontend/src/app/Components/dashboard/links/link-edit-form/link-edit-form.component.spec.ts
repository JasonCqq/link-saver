import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkEditFormComponent } from './link-edit-form.component';

describe('LinkEditFormComponent', () => {
  let component: LinkEditFormComponent;
  let fixture: ComponentFixture<LinkEditFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinkEditFormComponent]
    });
    fixture = TestBed.createComponent(LinkEditFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
