import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpAndSupportComponent } from './help-and-support.component';

describe('HelpAndSupportComponent', () => {
  let component: HelpAndSupportComponent;
  let fixture: ComponentFixture<HelpAndSupportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HelpAndSupportComponent]
    });
    fixture = TestBed.createComponent(HelpAndSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
