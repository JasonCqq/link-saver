import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ForgotLoginComponent } from "../forgot-login.component";

describe("ForgotLoginComponent", () => {
  let component: ForgotLoginComponent;
  let fixture: ComponentFixture<ForgotLoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ForgotLoginComponent],
    });
    fixture = TestBed.createComponent(ForgotLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
