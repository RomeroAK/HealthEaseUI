import { Component, OnInit } from '@angular/core';
import {PatientService} from '../../../services/patientProfileService/patient.service';
import {AuthService} from '../../../services/authService/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-patient-profile-component',
  templateUrl: './patient-profile.component.html',
  styleUrls: ['./patient-profile.component.css'],
  standalone: false
})
export class PatientProfileComponent implements OnInit {
  patientProfile: any = null;
  profileCompletion: any = null;
  isLoading = true;
  error: string | null = null;

  // Tab management
  activeTab = 'personal';
  tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'medical', label: 'Medical History', icon: '🏥' },
    { id: 'emergency', label: 'Emergency Contacts', icon: '🚨' },
    { id: 'insurance', label: 'Insurance', icon: '💳' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' }
  ];

  constructor(
    private patientService: PatientService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatientProfile();
  }

  loadPatientProfile(): void {
    this.isLoading = true;
    this.error = null;

    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    // Load both profile data and completion status
    Promise.all([
      this.patientService.getProfile().toPromise(),
      this.patientService.getProfileCompletionPercentage()
    ]).then(([profile, completion]) => {
      this.patientProfile = profile;
      this.profileCompletion = completion;
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading profile:', error);
      this.error = 'Failed to load profile information';
      this.isLoading = false;
    });
  }

  setActiveTab(tabId: string): void {
    this.activeTab = tabId;
  }

  editProfile(): void {
    this.router.navigate(['/patient/patient-profile-setup']);
  }

  calculateAge(dateOfBirth: string): number {
    if (!dateOfBirth) { return 0; }
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  calculateBMI(): number | null {
    if (!this.patientProfile?.medicalHistory?.height || !this.patientProfile?.medicalHistory?.weight) {
      return null;
    }

    const height = this.patientProfile.medicalHistory.height / 100; // Convert cm to m
    const weight = this.patientProfile.medicalHistory.weight;
    return Number((weight / (height * height)).toFixed(1));
  }

  getBMICategory(bmi: number): string {
    if (bmi < 18.5) { return 'Underweight'; }
    if (bmi < 25) { return 'Normal'; }
    if (bmi < 30) { return 'Overweight'; }
    return 'Obese';
  }

  getBMIColor(bmi: number): string {
    if (bmi < 18.5) { return '#f39c12'; } // Orange
    if (bmi < 25) { return '#27ae60'; }   // Green
    if (bmi < 30) { return '#f39c12'; }   // Orange
    return '#e74c3c';                 // Red
  }

  formatDate(date: string): string {
    if (!date) { return 'Not specified'; }
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatPhoneNumber(phone: string): string {
    if (!phone) { return 'Not specified'; }

    // Format South African phone numbers
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }
    return phone;
  }

  getCompletionColor(percentage: number): string {
    if (percentage >= 80) { return '#27ae60'; } // Green
    if (percentage >= 60) { return '#f39c12'; } // Orange
    return '#e74c3c'; // Red
  }

  shareProfile(): void {
    // Implement profile sharing functionality
    const shareUrl = `${window.location.origin}/patient/profile/${this.patientProfile.id}`;

    if (navigator.share) {
      navigator.share({
        title: 'My HealthEase Profile',
        text: 'View my health profile',
        url: shareUrl
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Profile link copied to clipboard');
      });
    }
  }

  hasData(data: any): boolean {
    if (!data) { return false; }
    if (Array.isArray(data)) { return data.length > 0; }
    if (typeof data === 'string') { return data.trim().length > 0; }
    if (typeof data === 'object') { return Object.keys(data).length > 0; }
    return true;
  }

}
