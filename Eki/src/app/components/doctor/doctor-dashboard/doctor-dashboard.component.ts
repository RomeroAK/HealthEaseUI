import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../../../services/doctorProfileService/doctor.service';
import { AuthService } from '../../../services/authService/auth.service';
import { Router } from '@angular/router';
import {Appointment, PatientAppointment} from '../../../model/doctor.related.interfaces';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css'],
  standalone: false
})
export class DoctorDashboardComponent implements OnInit {
  appointments: PatientAppointment[] = [];
  filteredAppointments: PatientAppointment[] = [];
  user: any;
  aiModalOpen = false;
  selectedTab: string = 'all';
  loading = false;

  tabOptions = [
    { key: 'all', label: 'All' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'cancelled', label: 'Cancelled' },
    { key: 'completed', label: 'Completed' }
  ];

  constructor(
    private doctorService: DoctorService,
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.currentUserValue;
  }

  ngOnInit(): void {
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    this.fetchAppointments();
  }

  fetchAppointments() {
    this.loading = true;
    this.doctorService.getDoctorAppointments(this.user.id).subscribe({
      next: (data: PatientAppointment[]) => {
        this.appointments = data;
        this.applyTabFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  applyTabFilter() {
    if (this.selectedTab === 'all') {
      this.filteredAppointments = this.appointments;
    } else if (this.selectedTab === 'upcoming') {
      const now = new Date();
      this.filteredAppointments = this.appointments.filter(a => a.status === 'confirmed' && new Date(a.appointmentDate) > now);
    } else {
      this.filteredAppointments = this.appointments.filter(a => a.status === this.selectedTab);
    }
  }

  onTabChange(tab: string) {
    this.selectedTab = tab;
    this.applyTabFilter();
  }

  confirmAppointment(appointment: PatientAppointment) {
    this.doctorService.confirmAppointment(appointment.id).subscribe(() => {
      this.fetchAppointments();
    });
  }

  openAiAssistant() {
    this.aiModalOpen = true;
  }
  onAiModalClose() {
    this.aiModalOpen = false;
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.aiModalOpen = false;
  }
}
