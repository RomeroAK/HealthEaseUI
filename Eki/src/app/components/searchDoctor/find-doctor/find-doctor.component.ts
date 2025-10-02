import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {DoctorService} from '../../../services/doctorProfileService/doctor.service';
import {FormsModule} from '@angular/forms';

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

  constructor(private doctorService: DoctorService, private router: Router) {}

  ngOnInit(): void {
    this.searchDoctors();
  }

  searchDoctors(): void {
    this.loading = true;
    // Example: You may need to adjust this to match your backend API
    this.doctorService.searchDoctors(this.searchFilters).subscribe({
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

  findNearbyDoctors(): void {
    this.loading = true;
    // Example: You may need to implement geolocation logic
    this.doctorService.findNearbyDoctors().subscribe({
      next: (doctors: any) => {
        this.doctors = doctors || [];
        this.loading = false;
      },
      error: () => {
        this.doctors = [];
        this.loading = false;
      }
    });
  }

  clearFilters(): void {
    this.searchFilters = { name: '', specialty: '', practiceName: '' };
    this.searchDoctors();
  }

  viewDoctorProfile(id: string): void {
    this.router.navigate(['/doctor/profile', id]);
  }

  bookAppointment(id: string): void {
    this.router.navigate(['/appointment/book', id]);
  }
}

