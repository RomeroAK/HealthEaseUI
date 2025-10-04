import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AppointmentModel } from '../../../model/appointment.model';
import { Doctor } from '../../../model/doctor.model';
import {AuthService} from '../../../services/authService/auth.service';
import {AppointmentService} from '../../../services/appointmentService/appointment.service';

function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return { pastDate: true };
  }
  return null;
}

@Component({
  selector: 'app-add-appointment',
  templateUrl: './add-appointment.component.html',
  styleUrl: './add-appointment.component.css',
  standalone: false
})
export class AddAppointmentComponent implements OnInit {
  @Input() doctorId: number | null = null;
  @Input() doctor: any | null = null;
  @Input() appointment: AppointmentModel | null = null; // For editing
  @Output() appointmentFinished = new EventEmitter<boolean>();
  appointmentTypeOptions = [
    { value: 'initial', text: 'Initial' },
    { value: 'follow_up', text: 'Follow Up' },
    { value: 'emergency', text: 'Emergency' },
    { value: 'virtual', text: 'Virtual' }
  ];
  appointmentForm: FormGroup;
  isEditMode = false;
  todayString: string = new Date().toISOString().split('T')[0];

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private appointmentService: AppointmentService) {
    this.appointmentForm = this.fb.group({
      doctorId: [null, Validators.required],
      patientId: [null, Validators.required],
      appointmentDate: ['', [Validators.required, futureDateValidator]],
      reason: ['', Validators.required],
      appointmentType: ['', Validators.required],
      status: ['confirmed']
    });
  }

  ngOnInit() {
    if (this.doctorId) {
      this.appointmentForm.patchValue({ doctorId: this.doctorId });
      const currentUser = this.authService.currentUserValue;
      if (currentUser && currentUser.role.toLowerCase() === 'patient') {
        this.appointmentForm.patchValue({ patientId: currentUser.id });
      }
    }
    if (this.appointment) {
      this.isEditMode = true;
      this.appointmentForm.patchValue(this.appointment);
    }
  }

  onSubmit() {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;
      this.appointmentService.bookAppointment(formValue).subscribe(
        response => {
          console.log('Appointment booked successfully:', response);
          this.finishAndClose();
        }
      )
    }
  }

  finishAndClose() {
    this.appointmentFinished.emit(true);
  }
}
