import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../services/authService/auth.service';
import {Appointment, Doctor, DoctorSearchCriteria, MedicalRecord} from '../../../model/doctor.related.interfaces';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {Prescription} from '../../../model/user.model';
import {forkJoin, Subject} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DoctorService} from '../../../services/doctorProfileService/doctor.service';
import {Patient} from '../../../model/patient.model';
import {PatientServiceService} from '../../../services/patientProfileService/patient-service.service';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
  standalone: false
})
export class PatientDashboardComponent implements OnInit {
  appointments: any[] = [];
  doctors: any[] = [];
  user: any;

  constructor(private router: Router, private patientService: PatientServiceService, private authService: AuthService) {
    const nav = this.router.getCurrentNavigation();
    this.user = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.patientService.getAppointments(this.user.id).subscribe(data => this.appointments = data);
    this.patientService.getAllDoctors().subscribe(data => this.doctors = data);
  }

  openAiAssistant(): void {
    alert('Launching AI Assistant...'); // Replace with actual logic or modal
  }
  showAppointments()
  {
    this.router.navigate(['/patient/appointments']);
  }

  cancelAppointment(id: number): void {
  }

  viewProfile(): void {
    this.router.navigate(['/patient/patient-view-profile']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearchDoctors(): void {
    this.router.navigate(['/patient/find-doctor']);
  }
}
