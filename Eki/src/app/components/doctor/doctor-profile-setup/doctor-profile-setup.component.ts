import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../services/authService/auth.service';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Subject} from 'rxjs';
import {DoctorService} from '../../../services/doctorProfileService/doctor.service';
import {takeUntil} from 'rxjs/operators';
import {Doctor, DoctorSpecialization} from '../../../model/doctor.related.interfaces';


@Component({
  selector: 'app-doctor-profile-setup',
  templateUrl: './doctor-profile-setup.component.html',
  styleUrls: ['./doctor-profile-setup.component.css'],
  standalone: false
})
export class DoctorProfileSetupComponent implements OnInit {
  profileForm: FormGroup;
  currentStep = 1;
  totalSteps = 5;
  isLoading = false;
  isSubmitting = false;
  profilePicture: File | null = null;
  profilePictureUrl: string | null = null;

  private destroy$ = new Subject<void>();

  // Static data
  specializations: DoctorSpecialization[] = [
    {id: '1', name: 'General Practice', category: 'Primary Care'},
    {id: '2', name: 'Cardiology', category: 'Specialist'},
    {id: '3', name: 'Dermatology', category: 'Specialist'},
    {id: '4', name: 'Neurology', category: 'Specialist'},
    {id: '5', name: 'Pediatrics', category: 'Specialist'},
    {id: '6', name: 'Orthopedics', category: 'Specialist'},
    {id: '7', name: 'Gynecology', category: 'Specialist'},
    {id: '8', name: 'Psychiatry', category: 'Mental Health'},
    {id: '9', name: 'Radiology', category: 'Diagnostic'},
    {id: '10', name: 'Emergency Medicine', category: 'Emergency'}
  ];
  medicalAidProviders = [
    'Discovery Health Medical Scheme',
    'Bonitas Medical Fund',
    'Momentum Health',
    'Fedhealth Medical Scheme',
    'Medihelp Medical Scheme',
    'Bestmed Medical Scheme',
    'Medshield Medical Scheme',
    'Genesis Medical Scheme',
    'Sizwe Hosmed Medical Scheme',
    'Keyhealth',
    'GEMS (Government Employees Medical Scheme)',
    'Bankmed',
    'Polmed',
    'CAMAF (Chartered Accountants Medical Aid Fund)',
    'Profmed',
    'OnePlan Health Insurance',
    'Sanlam Health Insurance',
    'Dis-Chem Health Insurance',
    'Essential Med',
    'GetSavvi Health',
    'Discovery Gap Cover',
    'Stratum Benefits (Gap Cover)'
  ];
  languages = [
    'English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sotho',
    'Tswana', 'Pedi', 'Venda', 'Tsonga', 'Ndebele', 'Swati'
  ];

  provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
  ];

  consultationTypes = [
    {value: 'in_person', label: 'In-Person'},
    {value: 'virtual', label: 'Virtual/Online'},
    {value: 'both', label: 'Both In-Person & Virtual'}
  ];

  selectedAcceptedInsurance: string[] = [];

  constructor(
    private fb: FormBuilder,
    private doctorService: DoctorService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.initializeForm();
  }

  ngOnInit(): void {
    this.loadExistingProfile();
  }

  initializeForm(): FormGroup {
    return this.fb.group({
      // step 1: Basic Information
      doctorInfo: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        fullName: ['', Validators.required],
        email: ['', [Validators.email]],
        telephone: ['', Validators.required],
        gender: ['', Validators.required],
        specialization: ['', Validators.required],
        licenseNumber: ['', Validators.required],
        consultationFee: [null],
        acceptedInsurance: [[]],
        isPrivatePractice: [false],
        practiceName: [''],
        hospitalName: ['', Validators.required],
        isActive: [true],
        clinicAddress: this.fb.group({
          street: [''],
          city: [''],
          province: [''],
          postalCode: [''],
          country: ['']
        }),
        hospitalAddress: this.fb.group({
          street: [''],
          city: [''],
          province: [''],
          postalCode: [''],
          country: ['']
        }),
        bio: ['']
      }),
    });
  }

  // Form Array Getters
  get specializationsArray(): FormArray {
    return this.profileForm.get('specializations') as FormArray;
  }

  get languagesArray(): FormArray {
    return this.profileForm.get('languagesSpoken') as FormArray;
  }

  get educationArray(): FormArray {
    return this.profileForm.get('education') as FormArray;
  }

  get certificationsArray(): FormArray {
    return this.profileForm.get('certifications') as FormArray;
  }

  get consultationTypesArray(): FormArray {
    return this.profileForm.get('consultationTypes') as FormArray;
  }

  get workingHoursArray(): FormArray {
    return this.profileForm.get('workingHours') as FormArray;
  }

  get insuranceProvidersArray(): FormArray {
    return this.profileForm.get('acceptedInsuranceProviders') as FormArray;
  }

  // Dynamic Form Methods
  addSpecialization(specialization: DoctorSpecialization): void {
    const control = this.fb.control(specialization.id);
    this.specializationsArray.push(control);
  }

  removeSpecialization(index: number): void {
    this.specializationsArray.removeAt(index);
  }

  addLanguage(language: string): void {
    const control = this.fb.control(language);
    this.languagesArray.push(control);
  }

  removeLanguage(index: number): void {
    this.languagesArray.removeAt(index);
  }

  addEducation(): void {
    const educationGroup = this.fb.group({
      institution: ['', Validators.required],
      degree: ['', Validators.required],
      fieldOfStudy: ['', Validators.required],
      startYear: ['', Validators.required],
      endYear: ['', Validators.required],
      isCurrentlyStudying: [false]
    });
    this.educationArray.push(educationGroup);
  }

  removeEducation(index: number): void {
    this.educationArray.removeAt(index);
  }

  addCertification(): void {
    const certificationGroup = this.fb.group({
      name: ['', Validators.required],
      issuingOrganization: ['', Validators.required],
      issueDate: ['', Validators.required],
      expiryDate: [''],
      credentialId: ['']
    });
    this.certificationsArray.push(certificationGroup);
  }

  removeCertification(index: number): void {
    this.certificationsArray.removeAt(index);
  }

  addConsultationType(type: string): void {
    const control = this.fb.control(type);
    this.consultationTypesArray.push(control);
  }

  removeConsultationType(index: number): void {
    this.consultationTypesArray.removeAt(index);
  }

  toggleConsultationType(value: string): void {
    this.consultationTypesArray.get(value);
  }

  addWorkingHours(): void {
    const workingHoursGroup = this.fb.group({
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      lunchBreakStart: [''],
      lunchBreakEnd: [''],
      isAvailable: [true]
    });
    this.workingHoursArray.push(workingHoursGroup);
  }

  removeWorkingHours(index: number): void {
    this.workingHoursArray.removeAt(index);
  }

  // File Upload Methods
  onProfilePictureSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      this.profilePicture = file;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePictureUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Navigation Methods
  nextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  // Validation Methods
  validateCurrentStep(): boolean {
    let fieldsToValidate: string[] = [];

    switch (this.currentStep) {
      case 1:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth', 'gender', 'idNumber'];
        break;
      case 2:
        fieldsToValidate = ['medicalLicenseNumber', 'hpcsaNumber', 'yearsOfExperience'];
        // Also validate arrays
        if (this.specializationsArray.length === 0) {
          alert('Please select at least one specialization');
          return false;
        }
        break;
      case 3:
        // Optional step - education can be empty initially
        break;
      case 4:
        fieldsToValidate = ['practiceName', 'practiceType'];
        // Validate address group
        const addressGroup = this.profileForm.get('address');
        if (addressGroup && addressGroup.invalid) {
          addressGroup.markAllAsTouched();
          return false;
        }
        break;
      case 5:
        if (!this.profileForm.get('agreeToTerms')?.value) {
          alert('Please agree to the terms and conditions');
          return false;
        }
        if (!this.profileForm.get('agreeToPrivacyPolicy')?.value) {
          alert('Please agree to the privacy policy');
          return false;
        }
        break;
    }

    // Mark fields as touched and validate
    fieldsToValidate.forEach(field => {
      const control = this.profileForm.get(field);
      if (control) {
        control.markAsTouched();
      }
    });

    // Check if any of the required fields are invalid
    const hasErrors = fieldsToValidate.some(field => {
      const control = this.profileForm.get(field);
      return control && control.invalid;
    });

    return !hasErrors;
  }

  // Tagbox logic for acceptedInsurance
  addAcceptedInsurance(selectBox: any): void {
    const provider = (selectBox as HTMLSelectElement).value;
    if (provider && !this.selectedAcceptedInsurance.includes(provider)) {
      this.selectedAcceptedInsurance.push(provider);
      this.updateAcceptedInsuranceFormValue();
    }
  }

  removeAcceptedInsurance(provider: string): void {
    this.selectedAcceptedInsurance = this.selectedAcceptedInsurance.filter(p => p !== provider);
    this.updateAcceptedInsuranceFormValue();
  }

  updateAcceptedInsuranceFormValue(): void {
    this.profileForm.get('acceptedInsurance')?.patchValue([...this.selectedAcceptedInsurance]);
  }

  // Utility Methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors["required"]) {
        return `${fieldName} is required`;
      }
      if (field.errors["email"]) {
        return 'Invalid email format';
      }
      if (field.errors["pattern"]) {
        return `Invalid ${fieldName} format`;
      }
      if (field.errors["minLength"]) {
        return `${fieldName} is too short`;
      }
      if (field.errors["min"]) {
        return `${fieldName} must be greater than 0`;
      }
    }
    return '';
  }

  // Data Loading
  loadExistingProfile(): void {
    this.isLoading = true;
    const currentUser = this.authService.currentUserValue;

    if (currentUser?.profileCompleted === true && currentUser.role === 'doctor') {
      this.doctorService.getProfile()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (doctor) => {
            if (doctor) {
              this.populateFormWithExistingData(doctor);
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading doctor profile:', error);
            this.isLoading = false;
          }
        });
    } else {
      this.isLoading = false;
    }
  }

  populateFormWithExistingData(doctor: Doctor): void {
    this.profileForm.patchValue({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phoneNumber: doctor.phoneNumber,
      gender: doctor.gender,
      medicalLicenseNumber: doctor.licenseNumber,
      practiceName: doctor.practiceName,
      bio: doctor.bio,
      acceptsInsurance: doctor.acceptedInsurance
    });

    // Sync tagbox UI with loaded data
    if (Array.isArray(doctor.acceptedInsurance)) {
      this.selectedAcceptedInsurance = [...doctor.acceptedInsurance];
      this.updateAcceptedInsuranceFormValue();
    } else {
      this.selectedAcceptedInsurance = [];
      this.updateAcceptedInsuranceFormValue();
    }

    // Populate address
    if (doctor.clinicAddress) {
      this.profileForm.get('address')?.patchValue(doctor.clinicAddress);
    }

    if (doctor.hospitalAddress) {
      this.profileForm.get('address')?.patchValue(doctor.hospitalAddress);
    }

    // Populate consultation fees
    if (doctor.consultationFee) {
      this.profileForm.get('consultationFees')?.patchValue(doctor.consultationFee);
    }
  }

  // Form Submission
  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isSubmitting = true;

      // Send JSON directly
      const jsonPayload = this.profileForm.value;
      jsonPayload.doctorInfo.acceptedInsurance = this.selectedAcceptedInsurance.join(',');
      this.doctorService.updateProfile(jsonPayload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            alert('Profile updated successfully!');
            this.router.navigate(['/doctor/doctor-dashboard']);
          },
          error: (error) => {
            this.isSubmitting = false;
            console.error('Error updating profile:', error);
            alert('Error updating profile. Please try again.');
          }
        });
    } else {
      this.markAllFieldsAsTouched();
      alert('Please fill in all required fields correctly.');
    }
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.profileForm.controls).forEach(key => {
      const control = this.profileForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  // Helper Methods for Template
  getStepTitle(step: number): string {
    const titles: Record<number, string> = {
      1: 'Basic Information',
      2: 'Professional Information',
      3: 'Education & Qualifications',
      4: 'Practice Information',
      5: 'Availability & Final Details'
    };
    return titles[step] || '';
  }

  getStepDescription(step: number): string {
    if (![1, 2, 3, 4, 5].includes(step)) {
      throw new Error(`Invalid step: ${step}. Must be between 1 and 5.`);
    }

    const descriptions: Record<number, string> = {
      1: 'Please provide your basic personal information',
      2: 'Enter your professional credentials and specializations',
      3: 'Add your educational background and certifications',
      4: 'Setup your practice details and consultation information',
      5: 'Set your availability and complete your profile'
    };

    return descriptions[step] || '';
  }

  getProgressPercentage(): number {
    return Math.round((this.currentStep / this.totalSteps) * 100);
  }

  removeInsuranceProvider(i: number): void {
    this.insuranceProvidersArray.removeAt(i);
  }

  addInsuranceProvider(value: string): void {
    this.insuranceProvidersArray.push(new FormControl(value));
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
