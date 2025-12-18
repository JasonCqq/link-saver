import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionLoginComponent } from './extension-login.component';

describe('ExtensionLoginComponent', () => {
  let component: ExtensionLoginComponent;
  let fixture: ComponentFixture<ExtensionLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExtensionLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtensionLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
