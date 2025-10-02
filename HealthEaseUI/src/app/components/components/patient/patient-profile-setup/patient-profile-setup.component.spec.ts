import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientProfileSetupComponent } from './patient-profile-setup.component';

describe('PatientProfileSetupComponent', () => {
  let component: PatientProfileSetupComponent;
  let fixture: ComponentFixture<PatientProfileSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientProfileSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientProfileSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
