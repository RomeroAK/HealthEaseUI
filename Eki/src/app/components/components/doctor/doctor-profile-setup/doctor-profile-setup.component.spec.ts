import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorProfileSetupComponent } from './doctor-profile-setup.component';

describe('DoctorProfileSetupComponent', () => {
  let component: DoctorProfileSetupComponent;
  let fixture: ComponentFixture<DoctorProfileSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorProfileSetupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorProfileSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
