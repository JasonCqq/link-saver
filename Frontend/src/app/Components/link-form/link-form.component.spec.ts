import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkFormComponent } from './link-form.component';

describe('LinkFormComponent', () => {
  let component: LinkFormComponent;
  let fixture: ComponentFixture<LinkFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinkFormComponent]
    });
    fixture = TestBed.createComponent(LinkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
