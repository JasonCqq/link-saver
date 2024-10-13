import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UrlbankComponent } from './urlbank.component';

describe('UrlbankComponent', () => {
  let component: UrlbankComponent;
  let fixture: ComponentFixture<UrlbankComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UrlbankComponent]
    });
    fixture = TestBed.createComponent(UrlbankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
