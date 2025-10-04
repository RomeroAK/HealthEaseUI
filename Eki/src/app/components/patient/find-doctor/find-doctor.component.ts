import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {DoctorService} from '../../../services/doctorProfileService/doctor.service';
import {FormsModule} from '@angular/forms';
import {PatientService} from '../../../services/patientProfileService/patient.service';
import { MatDialog } from '@angular/material/dialog';
import { AddAppointmentComponent } from '../../appointment/add-appointment/add-appointment.component';

@Component({
  selector: 'app-find-doctor',
  templateUrl: './find-doctor.component.html',
  standalone: false,
  styleUrls: ['./find-doctor.component.css']
})
export class FindDoctorComponent implements OnInit {
  searchFilters = {
    name: '',
    specialty: '',
    practiceName: ''
  };
  specialties: string[] = [
    'General Practice',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Gynecology',
    'Orthopedics',
    'Psychiatry',
    'Neurology',
    'Ophthalmology',
    'Dentistry'
  ];
  doctors: any[] = [];
  loading = false;
  showAddAppointmentModal = false;
  selectedDoctorId: number | null = null;
  selectedDoctor: any = null;

  constructor(private doctorService: DoctorService, private router: Router,
              private patientService: PatientService,
              private dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadAllDoctors();
  }

  private loadAllDoctors() {
    this.patientService.getAllDoctors().subscribe(data => {
      this.doctors = data
    });
  }

  searchDoctors(): void {
    this.loading = true;
    this.patientService.searchDoctors(this.searchFilters).subscribe({
      next: (doctors: any) => {
        this.doctors = doctors || [];
        this.loading = false;
      },
      error: (err: any) => {
        this.doctors = [];
        this.loading = false;
      }
    });
  }


  clearFilters(): void {
    this.searchFilters = { name: '', specialty: '', practiceName: '' };
    this.loadAllDoctors();
  }

  viewDoctorProfile(id: string): void {
    this.router.navigate([`/patient/find-doctor/${id}/profile`]);
  }

  openAddAppointmentModal(doctor: any): void {
    this.selectedDoctorId = doctor.id;
    this.selectedDoctor = doctor;
    this.showAddAppointmentModal = true;
  }

  closeAddAppointmentModal(refresh: boolean = false): void {
    this.showAddAppointmentModal = false;
    this.selectedDoctorId = null;
    this.selectedDoctor = null;
    if (refresh) {
      this.router.navigate(['/patient/patient-dashboard']);
    }
  }

  bookAppointment(id: string): void {
    const doctor = this.doctors.find((d: any) => d.id === id);
    if (doctor) {
      this.openAddAppointmentModal(doctor);
    }
  }
}
