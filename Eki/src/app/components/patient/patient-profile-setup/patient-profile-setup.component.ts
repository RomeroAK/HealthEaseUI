import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../../services/authService/auth.service';
import {Router} from '@angular/router';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Patient} from '../../../model/patient.model';
import {PatientService} from '../../../services/patientProfileService/patient.service';


@Component({
  selector: 'app-patient-profile-setup',
  templateUrl: './patient-profile-setup.component.html',
  styleUrls: ['./patient-profile-setup.component.css'],
  standalone: false
})
export class PatientProfileSetupComponent implements OnInit {
  profileForm: FormGroup;
  currentStep = 1;
  totalSteps = 4;
  isSubmitting = false;
  profilePictureFile: File | null = null;
  profilePicturePreview: string | null = null;
  maxDate = new Date().toISOString().split('T')[0];
  protected readonly Date = Date;

  // Step validation flags
  personalInfoValid = false;
  medicalHistoryValid = false;
  emergencyContactsValid = false;
  insuranceInfoValid = false;

  // Form options
  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
  genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  relationshipTypes = ['Spouse', 'Parent', 'Child', 'Sibling', 'Friend', 'Other'];

  provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
    'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadExistingProfile();
    this.setupFormValidation();

    const insuranceInfo = this.profileForm.get('insuranceInfo');
    const primaryInsurance = insuranceInfo?.get('primaryInsurance');
    const hasInsuranceControl = insuranceInfo?.get('hasInsurance');

    hasInsuranceControl?.valueChanges.subscribe((hasInsurance: boolean) => {
      if (hasInsurance) {
        primaryInsurance?.get('provider')?.setValidators([Validators.required]);
        primaryInsurance?.get('policyNumber')?.setValidators([Validators.required]);
      } else {
        primaryInsurance?.get('provider')?.clearValidators();
        primaryInsurance?.get('policyNumber')?.clearValidators();
        primaryInsurance?.get('provider')?.setValue('');
        primaryInsurance?.get('policyNumber')?.setValue('');
      }
      primaryInsurance?.get('provider')?.updateValueAndValidity();
      primaryInsurance?.get('policyNumber')?.updateValueAndValidity();
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      // Step 1: Personal Information
      personalInfo: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        dateOfBirth: ['', Validators.required],
        gender: ['', Validators.required],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+27|0)[6-8][0-9]{8}$/)]],
        alternatePhoneNumber: [''],
        idNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{13}$/)]],
        address: this.fb.group({
          street: ['', Validators.required],
          suburb: ['', Validators.required],
          city: ['', Validators.required],
          province: ['', Validators.required],
          postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{4}$/)]],
          country: ['South Africa']
        }),
        occupation: [''],
        employer: [''],
        maritalStatus: [''],
        preferredLanguage: ['English'],
        profilePicture: ['']
      }),

      // Step 2: Medical Information
      medicalHistory: this.fb.group({
        bloodType: [''],
        height: ['', [Validators.min(50), Validators.max(300)]],
        weight: ['', [Validators.min(20), Validators.max(500)]],
        allergies: this.fb.array([]),
        chronicConditions: this.fb.array([]),
        currentMedications: this.fb.array([]),
        previousSurgeries: this.fb.array([]),
        familyMedicalHistory: [''],
        smokingStatus: [''],
        alcoholConsumption: [''],
        exerciseFrequency: [''],
        dietaryRestrictions: [''],
        vaccinationStatus: this.fb.group({
          covid19: [false],
          flu: [false],
          hepatitisB: [false],
          tetanus: [false],
          other: ['']
        })
      }),

      // Step 3: Emergency Contacts
      emergencyContacts: this.fb.array([
        this.createEmergencyContactGroup()
      ]),

      // Step 4: Insurance Information
      insuranceInfo: this.fb.group({
        hasInsurance: [false],
        primaryInsurance: this.fb.group({
          provider: [''],
          policyNumber: [''],
          groupNumber: [''],
          planName: [''],
          effectiveDate: [''],
          expirationDate: [''],
          copayAmount: [''],
          deductibleAmount: ['']
        }),
        secondaryInsurance: this.fb.group({
          hasSecondary: [false],
          provider: [''],
          policyNumber: [''],
          groupNumber: [''],
          planName: ['']
        }),
        medicalAidNumber: [''],
        dependentCode: [''],
        authorizationRequired: [false]
      }),

      // Additional preferences
      preferences: this.fb.group({
        preferredDoctorGender: [''],
        preferredLanguage: ['English'],
        communicationPreferences: this.fb.group({
          emailReminders: [true],
          smsReminders: [true],
          appointmentConfirmations: [true],
          testResults: [true],
          promotionalEmails: [false]
        }),
        privacySettings: this.fb.group({
          shareDataWithResearch: [false],
          allowMarketingCommunication: [false],
          profileVisibility: ['private']
        })
      })
    });
  }

  createEmergencyContactGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      relationship: ['', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^(\+27|0)[6-8][0-9]{8}$/)]],
      alternatePhoneNumber: [''],
      email: ['', Validators.email],
      address: [''],
      isPrimary: [false],
      canMakeDecisions: [false]
    });
  }

  createMedicalItemGroup(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: [''],
      severity: [''],
      startDate: [''],
      endDate: [''],
      notes: ['']
    });
  }

  // Form Array Getters
  get allergies(): FormArray {
    return this.profileForm.get('medicalHistory.allergies') as FormArray;
  }

  get chronicConditions(): FormArray {
    return this.profileForm.get('medicalHistory.chronicConditions') as FormArray;
  }

  get currentMedications(): FormArray {
    return this.profileForm.get('medicalHistory.currentMedications') as FormArray;
  }

  get previousSurgeries(): FormArray {
    return this.profileForm.get('medicalHistory.previousSurgeries') as FormArray;
  }

  get emergencyContactsArray(): FormArray {
    return this.profileForm.get('emergencyContacts') as FormArray;
  }

  // Dynamic form methods
  addAllergy(): void {
    this.allergies.push(this.createMedicalItemGroup());
  }

  removeAllergy(index: number): void {
    this.allergies.removeAt(index);
  }

  addChronicCondition(): void {
    this.chronicConditions.push(this.createMedicalItemGroup());
  }

  removeChronicCondition(index: number): void {
    this.chronicConditions.removeAt(index);
  }

  addMedication(): void {
    this.currentMedications.push(this.createMedicalItemGroup());
  }

  removeMedication(index: number): void {
    this.currentMedications.removeAt(index);
  }

  addSurgery(): void {
    this.previousSurgeries.push(this.createMedicalItemGroup());
  }

  removeSurgery(index: number): void {
    this.previousSurgeries.removeAt(index);
  }

  addEmergencyContact(): void {
    this.emergencyContactsArray.push(this.createEmergencyContactGroup());
  }

  removeEmergencyContact(index: number): void {
    if (this.emergencyContactsArray.length > 1) {
      this.emergencyContactsArray.removeAt(index);
    }
  }

  // Profile picture handling
  onProfilePictureSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.profilePictureFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profilePicturePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeProfilePicture(): void {
    this.profilePictureFile = null;
    this.profilePicturePreview = null;
  }

  // Step navigation
  nextStep(): void {
    if (this.isStepValid(this.currentStep)) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep || this.isStepValid(step - 1)) {
      this.currentStep = step;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return this.profileForm.get('personalInfo')?.valid || false;
      case 2:
        return true; // Medical info is optional
      case 3:
        return this.emergencyContactsArray.valid;
      case 4:
        return true; // Insurance info is optional
      default:
        return false;
    }
  }

  setupFormValidation(): void {
    // Watch for changes in insurance checkbox
    this.profileForm.get('insuranceInfo.hasInsurance')?.valueChanges.subscribe(hasInsurance => {
      const primaryInsurance = this.profileForm.get('insuranceInfo.primaryInsurance');
      if (hasInsurance) {
        primaryInsurance?.get('provider')?.setValidators([Validators.required]);
        primaryInsurance?.get('policyNumber')?.setValidators([Validators.required]);
      } else {
        primaryInsurance?.get('provider')?.clearValidators();
        primaryInsurance?.get('policyNumber')?.clearValidators();
      }
      primaryInsurance?.updateValueAndValidity();
    });

    // Watch for changes in secondary insurance checkbox
    this.profileForm.get('insuranceInfo.secondaryInsurance.hasSecondary')?.valueChanges.subscribe(hasSecondary => {
      const secondaryInsurance = this.profileForm.get('insuranceInfo.secondaryInsurance');
      if (hasSecondary) {
        secondaryInsurance?.get('provider')?.setValidators([Validators.required]);
        secondaryInsurance?.get('policyNumber')?.setValidators([Validators.required]);
      } else {
        secondaryInsurance?.get('provider')?.clearValidators();
        secondaryInsurance?.get('policyNumber')?.clearValidators();
      }
      secondaryInsurance?.updateValueAndValidity();
    });
  }

  /**
   * Ensures all fields are initialized for editing, even if missing/null from API
   */
  normalizePatient(patient: any): any {
    return {
      id: patient.id ?? null,
      userId: patient.userId ?? null,
      firstName: patient.firstName ?? '',
      lastName: patient.lastName ?? '',
      email: patient.email ?? '',
      phoneNumber: patient.phoneNumber ?? '',
      alternatePhoneNumber: patient.alternatePhoneNumber ?? '',
      dateOfBirth: patient.dateOfBirth ?? '',
      gender: patient.gender ?? '',
      idNumber: patient.idNumber ?? '',
      maritalStatus: patient.maritalStatus ?? '',
      employer: patient.employer ?? '',
      occupation: patient.occupation ?? '',
      profilePicture: patient.profilePicture ?? null,
      address: {
        street: patient.address?.street ?? '',
        suburb: patient.address?.suburb ?? '',
        city: patient.address?.city ?? '',
        province: patient.address?.province ?? '',
        postalCode: patient.address?.postalCode ?? '',
        country: patient.address?.country ?? '',
      },
      insurance: patient.insurance ?? {
        provider: '',
        policyNumber: '',
        planName: '',
        groupNumber: '',
        effectiveDate: '',
        expirationDate: '',
        copayAmount: '',
        deductibleAmount: '',
        secondaryProvider: '',
        secondaryPolicyNumber: '',
        dependentCode: '',
        authorizationRequired: false,
      },
      medicalAidNumber: patient.medicalAidNumber ?? '',
      medicalHistory: {
        bloodType: patient.medicalHistory?.bloodType ?? '',
        height: patient.medicalHistory?.height ?? null,
        weight: patient.medicalHistory?.weight ?? null,
        smokingStatus: patient.medicalHistory?.smokingStatus ?? '',
        alcoholConsumption: patient.medicalHistory?.alcoholConsumption ?? '',
        exerciseFrequency: patient.medicalHistory?.exerciseFrequency ?? '',
        dietaryRestrictions: patient.medicalHistory?.dietaryRestrictions ?? '',
        allergies: patient.medicalHistory?.allergies ?? [],
        chronicConditions: patient.medicalHistory?.chronicConditions ?? [],
        currentMedications: patient.medicalHistory?.currentMedications ?? [],
        previousSurgeries: patient.medicalHistory?.previousSurgeries ?? [],
        familyMedicalHistory: patient.medicalHistory?.familyMedicalHistory ?? '',
        vaccinationStatus: patient.medicalHistory?.vaccinationStatus ?? '',
      },
      emergencyContacts: patient.emergencyContacts ?? [],
      preferences: {
        preferredDoctorGender: patient.preferences?.preferredDoctorGender ?? '',
        preferredLanguage: patient.preferences?.preferredLanguage ?? 'English',
        communicationPreferences: patient.preferences?.communicationPreferences ?? {
          emailReminders: false,
          smsReminders: false,
          appointmentConfirmations: false,
          testResults: false,
          promotionalEmails: false,
        },
        privacySettings: patient.preferences?.privacySettings ?? {
          shareDataWithResearch: false,
          allowMarketingCommunication: false,
          profileVisibility: 'Private',
        }
      },
    };
  }

  loadExistingProfile(): void {
    const currentUser = this.authService.currentUser$;
    if (currentUser) {
      this.patientService.getProfile().subscribe({
        next: (patient): void => {
          if (patient) {
            const normalizedPatient = this.normalizePatient(patient);
            this.populateForm(normalizedPatient);
          }
        },
        error: (error): void => {
          console.error('Error loading patient profile:', error);
        }
      });
    }
  }

  populateForm(patient: Patient): void {
    // Populate personal info
    this.profileForm.patchValue({
      personalInfo: {
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        phoneNumber: patient.phoneNumber,
        alternatePhoneNumber: patient.alternatePhoneNumber,
        idNumber: patient.idNumber,
        address: patient.address,
        occupation: patient.occupation,
        employer: patient.employer,
        maritalStatus: patient.maritalStatus,
        preferredLanguage: patient.preferences?.preferredLanguage ?? 'English'
      },
      preferences: {
        preferredDoctorGender: patient.preferences?.preferredDoctorGender ?? '',
        preferredLanguage: patient.preferences?.preferredLanguage ?? 'English',
        communicationPreferences: {
          emailReminders: patient.preferences?.communicationPreferences?.emailReminders ?? true,
          smsReminders: patient.preferences?.communicationPreferences?.smsReminders ?? true,
          appointmentConfirmations: patient.preferences?.communicationPreferences?.appointmentConfirmations ?? true,
          testResults: patient.preferences?.communicationPreferences?.testResults ?? true,
          promotionalEmails: patient.preferences?.communicationPreferences?.promotionalEmails ?? false
        },
        privacySettings: {
          shareDataWithResearch: patient.preferences?.privacySettings?.shareDataWithResearch ?? false,
          allowMarketingCommunication: patient.preferences?.privacySettings?.allowMarketingCommunication ?? false,
          profileVisibility: patient.preferences?.privacySettings?.profileVisibility ?? 'private'
        }
      }
    });

    // Populate emergency contacts
    if (patient.emergencyContacts && patient.emergencyContacts.length > 0) {
      this.emergencyContactsArray.clear();
      patient.emergencyContacts.forEach(contact => {
        this.emergencyContactsArray.push(this.fb.group(contact));
      });
    }

    // Populate medical info
    if (patient.medicalHistory) {
      // Patch primitive fields except vaccinationStatus
      this.profileForm.get('medicalHistory')?.patchValue({
        bloodType: patient.medicalHistory.bloodType,
        height: patient.medicalHistory.height,
        weight: patient.medicalHistory.weight,
        smokingStatus: patient.medicalHistory.smokingStatus,
        alcoholConsumption: patient.medicalHistory.alcoholConsumption,
        exerciseFrequency: patient.medicalHistory.exerciseFrequency,
        dietaryRestrictions: patient.medicalHistory.dietaryRestrictions,
        familyMedicalHistory: patient.medicalHistory.familyMedicalHistory
      });

      // Vaccination Status (parse comma-separated string)
      const vaccinationString = patient.medicalHistory.vaccinationStatus || '';
      const vaccinations = vaccinationString.split(',').map((v: any) => v.trim().toLowerCase()).filter(Boolean);
      const knownVaccines = {
        covid19: ['covid-19', 'covid19', 'covid'],
        flu: ['flu', 'influenza'],
        hepatitisB: ['hepatitis b', 'hepatitisb', 'hep b', 'hepb'],
        tetanus: ['tetanus']
      };
      const vaccinationFormValue: any = {
        covid19: false,
        flu: false,
        hepatitisB: false,
        tetanus: false,
        other: ''
      };
      const others: string[] = [];
      vaccinations.forEach((vac: any) => {
        let matched = false;
        for (const [key, aliases] of Object.entries(knownVaccines)) {
          if (aliases.includes(vac)) {
            vaccinationFormValue[key] = true;
            matched = true;
            break;
          }
        }
        if (!matched) {
          others.push(vac);
        }
      });
      vaccinationFormValue.other = others.join(', ');
      this.profileForm.get('medicalHistory.vaccinationStatus')?.patchValue(vaccinationFormValue);

      // Allergies
      this.allergies.clear();
      (patient.medicalHistory.allergies || []).forEach((allergy: any) => {
        this.allergies.push(this.createMedicalItemGroup());
        this.allergies.at(this.allergies.length - 1).patchValue(allergy);
      });

      // Chronic Conditions
      this.chronicConditions.clear();
      (patient.medicalHistory.chronicConditions || []).forEach((condition: any) => {
        this.chronicConditions.push(this.createMedicalItemGroup());
        this.chronicConditions.at(this.chronicConditions.length - 1).patchValue(condition);
      });

      // Current Medications
      this.currentMedications.clear();
      (patient.medicalHistory.currentMedications || []).forEach((medication: any) => {
        this.currentMedications.push(this.createMedicalItemGroup());
        this.currentMedications.at(this.currentMedications.length - 1).patchValue(medication);
      });

      // Previous Surgeries
      this.previousSurgeries.clear();
      (patient.medicalHistory.previousSurgeries || []).forEach((surgery: any) => {
        this.previousSurgeries.push(this.createMedicalItemGroup());
        this.previousSurgeries.at(this.previousSurgeries.length - 1).patchValue(surgery);
      });
    }

    // Populate insurance info
    if (patient.insurance) {
      this.profileForm.patchValue({
        insuranceInfo: {
          hasInsurance: true,
          primaryInsurance: patient.medicalAidName,
          medicalAidNumber: patient.medicalAidNumber
        }
      });
    }
  }

  calculateAge(): number | null {
    const birthDate = this.profileForm.get('personalInfo.dateOfBirth')?.value;
    if (birthDate) {
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    }
    return null;
  }

  calculateBMI(): number | null {
    const height = this.profileForm.get('medicalHistory.height')?.value;
    const weight = this.profileForm.get('medicalHistory.weight')?.value;

    if (height && weight) {
      const heightInMeters = height / 100;
      return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
    }
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.profileForm.valid) {
      this.isSubmitting = true;

      try {
        const profileData = this.buildProfileData();
        await this.patientService.updateProfile(profileData).toPromise();

        // Navigate to dashboard
        this.router.navigate(['/patient/patient-dashboard']);
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile. Please try again.');
      } finally {
        this.isSubmitting = false;
      }
    } else {
      this.markFormGroupTouched(this.profileForm);
      alert('Please fill in all required fields.');
    }
  }

  buildProfileData(): any {
    const formValue = this.profileForm.value;

    return {
      personalInfo: formValue.personalInfo,
      medicalHistory: {
        ...formValue.medicalHistory,
        allergies: formValue.medicalHistory.allergies,
        chronicConditions: formValue.medicalHistory.chronicConditions,
        currentMedications: formValue.medicalHistory.currentMedications,
        previousSurgeries: formValue.medicalHistory.previousSurgeries
      },
      emergencyContacts: formValue.emergencyContacts,
      insurance: formValue.insuranceInfo.hasInsurance ? formValue.insuranceInfo.primaryInsurance : null,
      medicalAidNumber: formValue.insuranceInfo.medicalAidNumber,
      preferences: formValue.preferences
    };
  }

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          } else {
            arrayControl.markAsTouched();
          }
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  skipStep(): void {
    this.nextStep();
  }

  saveDraft(): void {
    // Save current form state to localStorage
    localStorage.setItem('patientProfileDraft', JSON.stringify(this.profileForm.value));
    alert('Profile draft saved!');
  }

  loadDraft(): void {
    const draft = localStorage.getItem('patientProfileDraft');
    if (draft) {
      this.profileForm.patchValue(JSON.parse(draft));
      alert('Profile draft loaded!');
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
