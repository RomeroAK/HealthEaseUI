import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../../services/doctorProfileService/doctor.service';
import { Doctor } from '../../../model/doctor.related.interfaces';

@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.css'],
  standalone: false
})
export class DoctorProfileComponent implements OnInit {
  doctor: Doctor | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(private doctorService: DoctorService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const doctorId = Number(this.route.snapshot.paramMap.get('id'));
    if (!doctorId) {
      this.error = 'Invalid doctor ID.';
      this.isLoading = false;
      return;
    }
    this.doctorService.getDoctorProfile(doctorId).subscribe({
      next: (doctor) => {
        this.doctor = doctor;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Could not load doctor profile.';
        this.isLoading = false;
      }
    });
  }
}

