import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import {Appointment} from '../../../model/doctor.related.interfaces';
import {AppointmentService} from '../../../services/appointmentService/appointment.service';
import {AuthService} from '../../../services/authService/auth.service';
import { AddAppointmentComponent } from '../add-appointment/add-appointment.component';

@Component({
  selector: 'app-patient-appointment',
  templateUrl: './patient-appointment.component.html',
  styleUrls: ['./patient-appointment.component.css'],
  standalone: false
})
export class PatientAppointmentComponent implements OnInit {
  userId: number | undefined;
  appointments: Appointment[] = [];
  activeTab: 'upcoming' | 'past' = 'upcoming';
  loading = false;
  showAddAppointmentModal = false;
  selectedDoctorId: number | null = null;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router
  ) {
    this.userId = this.authService.currentUserIdValue;
  }

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;

    const service = this.activeTab === 'upcoming'
      ? this.appointmentService.getUpcomingAppointments()
      : this.appointmentService.getPastAppointments();

    service.subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading appointments', error);
        this.loading = false;
      }
    });
  }

  switchTab(tab: 'upcoming' | 'past'): void {
    this.activeTab = tab;
    this.loadAppointments();
  }

  cancelAppointment(appointmentId: string): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.appointmentService.cancelAppointment(appointmentId).subscribe({
        next: () => {
          alert('Appointment cancelled successfully');
          this.loadAppointments();
        },
        error: (error) => {
          alert('Error cancelling appointment');
          console.error(error);
        }
      });
    }
  }

  rescheduleAppointment(appointmentId: string): void {
    this.router.navigate(['/reschedule', appointmentId]);
  }

  viewDetails(appointmentId: string): void {
    this.router.navigate(['/appointments', appointmentId]);
  }

  openAddAppointmentModal(doctorId?: number): void {
    this.selectedDoctorId = doctorId || null;
    this.showAddAppointmentModal = true;
  }

  closeAddAppointmentModal(refresh: boolean = false): void {
    this.showAddAppointmentModal = false;
    this.selectedDoctorId = null;
    if (refresh) {
      this.loadAppointments();
    }
  }

  bookNewAppointment(): void {
    this.openAddAppointmentModal();
  }

  getStatusColor(status: string): string {
    return this.appointmentService.getStatusColor(status);
  }

}
