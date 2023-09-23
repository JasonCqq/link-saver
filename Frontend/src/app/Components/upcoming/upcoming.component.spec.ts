import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingComponent } from './upcoming.component';

describe('UpcomingComponent', () => {
  let component: UpcomingComponent;
  let fixture: ComponentFixture<UpcomingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UpcomingComponent]
    });
    fixture = TestBed.createComponent(UpcomingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
