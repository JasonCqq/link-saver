import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicFolderComponent } from './public-folder.component';

describe('PublicFolderComponent', () => {
  let component: PublicFolderComponent;
  let fixture: ComponentFixture<PublicFolderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PublicFolderComponent]
    });
    fixture = TestBed.createComponent(PublicFolderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
