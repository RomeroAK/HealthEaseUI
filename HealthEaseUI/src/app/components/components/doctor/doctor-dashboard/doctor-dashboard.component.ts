import { Component, OnInit } from '@angular/core';
import {forkJoin, Subject} from 'rxjs';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DoctorService} from '../../../../services/doctorProfileService/doctor.service';
import {AuthService} from '../../../../services/authService/auth.service';
import {Router} from '@angular/router';
import {debounceTime, distinctUntilChanged, takeUntil} from 'rxjs/operators';
import {DoctorSearchCriteria, DoctorStatistics} from '../../../../model/doctor.related.interfaces';
import {Patient} from '../../../../model/patient.model';
import {Doctor, Appointment} from '../../../../model/doctor.related.interfaces';

@Component({
  selector: 'app-doctor-dashboard',
  templateUrl: './doctor-dashboard.component.html',
  styleUrls: ['./doctor-dashboard.component.css']
})
export class DoctorDashboardComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  }




