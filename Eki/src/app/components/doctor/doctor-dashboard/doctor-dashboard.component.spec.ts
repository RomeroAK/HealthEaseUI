import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { DoctorProfileSetupComponent } from '../doctor-profile-setup/doctor-profile-setup.component';
import {AuthService} from '../../../services/authService/auth.service';
import {DoctorService} from '../../../services/doctorProfileService/doctor.service';


describe('DoctorProfileSetupComponent', () => {
  let component: DoctorProfileSetupComponent;
  let fixture: ComponentFixture<DoctorProfileSetupComponent>;
  let mockDoctorService: jasmine.SpyObj<DoctorService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const doctorServiceSpy = jasmine.createSpyObj('DoctorService', ['getDoctorProfile', 'updateDoctorProfile']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [DoctorProfileSetupComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: DoctorService, useValue: doctorServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorProfileSetupComponent);
    component = fixture.componentInstance;
    mockDoctorService = TestBed.inject(DoctorService) as jasmine.SpyObj<DoctorService>;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    mockAuthService.getCurrentUser.and.returnValue({
      id: '123',
      email: 'test@example.com',
      role: 'doctor'
    });
    mockDoctorService.getDoctorProfile.and.returnValue(of(null));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', () => {
    expect(component.profileForm).toBeDefined();
    expect(component.currentStep).toBe(1);
    expect(component.totalSteps).toBe(5);
  });

  it('should validate current step before proceeding', () => {
    spyOn(component, 'validateCurrentStep').and.returnValue(false);
    const initialStep = component.currentStep;

    component.nextStep();

    expect(component.currentStep).toBe(initialStep);
  });

  it('should proceed to next step when validation passes', () => {
    spyOn(component, 'validateCurrentStep').and.returnValue(true);

    component.nextStep();

    expect(component.currentStep).toBe(2);
  });

  it('should go to previous step', () => {
    component.currentStep = 3;

    component.previousStep();

    expect(component.currentStep).toBe(2);
  });

  it('should not go to previous step if already at first step', () => {
    component.currentStep = 1;

    component.previousStep();

    expect(component.currentStep).toBe(1);
  });

  it('should add specialization', () => {
    const specialization: DoctorSpecialization = {
      id: '1',
      name: 'Cardiology',
      category: 'Specialist'
    };

    component.toggleSpecialization(specialization);

    expect(component.specializationsArray.length).toBe(1);
    expect(component.specializationsArray.value).toContain('1');
  });

  it('should remove specialization if already selected', () => {
    const specialization: DoctorSpecialization = {
      id: '1',
      name: 'Cardiology',
      category: 'Specialist'
    };

    // Add first
    component.toggleSpecialization(specialization);
    expect(component.specializationsArray.length).toBe(1);

    // Remove
    component.toggleSpecialization(specialization);
    expect(component.specializationsArray.length).toBe(0);
  });

  it('should add language', () => {
    component.addLanguage('English');

    expect(component.languagesArray.length).toBe(1);
    expect(component.languagesArray.value).toContain('English');
  });

  it('should remove language', () => {
    component.addLanguage('English');
    component.addLanguage('Afrikaans');

    component.removeLanguage(0);

    expect(component.languagesArray.length).toBe(1);
    expect(component.languagesArray.value).toContain('Afrikaans');
  });

  it('should add education entry', () => {
    component.addEducation();

    expect(component.educationArray.length).toBe(1);
  });

  it('should remove education entry', () => {
    component.addEducation();
    component.addEducation();

    component.removeEducation(0);

    expect(component.educationArray.length).toBe(1);
  });

  it('should handle profile picture selection', () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    };

    component.onProfilePictureSelected(mockEvent);

    expect(component.profilePicture).toBe(mockFile);
  });

  it('should reject large files', () => {
    spyOn(window, 'alert');
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const mockEvent = {
      target: {
        files: [largeFile]
      }
    };

    component.onProfilePictureSelected(mockEvent);

    expect(window.alert).toHaveBeenCalledWith('File size should not exceed 5MB');
    expect(component.profilePicture).toBeNull();
  });

  it('should reject non-image files', () => {
    spyOn(window, 'alert');
    const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const mockEvent = {
      target: {
        files: [textFile]
      }
    };

    component.onProfilePictureSelected(mockEvent);

    expect(window.alert).toHaveBeenCalledWith('Please select a valid image file');
    expect(component.profilePicture).toBeNull();
  });

  it('should submit form successfully', () => {
    // Setup valid form
    component.profileForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '0123456789',
      dateOfBirth: '1980-01-01',
      gender: 'male',
      idNumber: '8001010001086',
      medicalLicenseNumber: 'ML123456',
      hpcsaNumber: 'HP123456',
      yearsOfExperience: 10,
      practiceName: 'Test Practice',
      practiceType: 'private',
      agreeToTerms: true,
      agreeToPrivacyPolicy: true
    });

    // Add required array values
    component.specializationsArray.push(component.fb.control('1'));

    mockDoctorService.updateDoctorProfile.and.returnValue(of({ success: true }));

    component.onSubmit();

    expect(mockDoctorService.updateDoctorProfile).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/doctor/dashboard']);
  });

  it('should handle form submission error', () => {
    spyOn(window, 'alert');
    component.profileForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      agreeToTerms: true,
      agreeToPrivacyPolicy: true
    });

    mockDoctorService.updateDoctorProfile.and.returnValue(throwError('Server error'));

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('Error updating profile. Please try again.');
  });

  it('should calculate progress percentage correctly', () => {
    component.currentStep = 3;
    component.totalSteps = 5;

    const percentage = component.getProgressPercentage();

    expect(percentage).toBe(60);
  });

  it('should load existing profile data', () => {
    const mockDoctor = {
      id: '123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phoneNumber: '0123456789',
      dateOfBirth: '1980-01-01',
      gender: 'male',
      medicalLicenseNumber: 'ML123456',
      hpcsaNumber: 'HP123456',
      yearsOfExperience: 10,
      practiceName: 'Test Practice',
      practiceType: 'private',
      bio: 'Test bio',
      emergencyAvailable: true,
      acceptsInsurance: false
    };

    mockDoctorService.getDoctorProfile.and.returnValue(of(mockDoctor));

    component.loadExistingProfile();

    expect(component.profileForm.get('firstName')?.value).toBe('John');
    expect(component.profileForm.get('lastName')?.value).toBe('Doe');
  });
});
