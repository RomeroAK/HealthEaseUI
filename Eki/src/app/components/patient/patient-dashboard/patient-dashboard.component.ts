import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {AuthService} from '../../../services/authService/auth.service';
import {Appointment, Doctor, DoctorSearchCriteria, MedicalRecord} from '../../../model/doctor.related.interfaces';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {Prescription} from '../../../model/user.model';
import {forkJoin, Subject} from 'rxjs';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DoctorService} from '../../../services/doctorProfileService/doctor.service';
import {Patient} from '../../../model/patient.model';
import {PatientService} from '../../../services/patientProfileService/patient.service';
import { ViewportScroller } from '@angular/common';
@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
  standalone: false
})
export class PatientDashboardComponent implements OnInit {
  appointments: any[] = [];
  user: any;
  aiModalOpen = false;

  constructor(
    private router: Router,
    private patientService: PatientService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private viewportScroller: ViewportScroller
  ) {
    const nav = this.router.getCurrentNavigation();
    this.user = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        setTimeout(() => this.viewportScroller.scrollToAnchor(fragment), 0);
      }
    });
    this.patientService.getUpcomingAppointments().subscribe(data => {
      this.appointments = data
    });
  }

  openAiAssistant(): void {
    this.aiModalOpen = true;
  }

  onAiModalClose(): void {
    this.aiModalOpen = false;
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
    // Clear AI chat history on logout
    this.aiModalOpen = false;
  }

  onSearchDoctors(): void {
    this.router.navigate(['/patient/find-doctor']);
  }

  bookAppointment(doctor: any): void {
    // TODO: Implement booking logic or navigation
    alert('Booking appointment with Dr. ' + (doctor.fullName || doctor.firstName + ' ' + doctor.lastName));
  }
}
