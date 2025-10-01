import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientProfileComponentComponent } from './patient-profile-component.component';

describe('PatientPtofileComponentComponent', () => {
  let component: PatientProfileComponentComponent;
  let fixture: ComponentFixture<PatientProfileComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientProfileComponentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientProfileComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
