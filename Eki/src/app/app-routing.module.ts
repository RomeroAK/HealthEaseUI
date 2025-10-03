import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from './gaurd/guards/auth.guard';
import {LoginComponent} from './components/auth/login/login.component';
import {RegisterComponent} from './components/auth/register/register.component';
import {PatientDashboardComponent} from './components/patient/patient-dashboard/patient-dashboard.component';
import {DoctorDashboardComponent} from './components/doctor/doctor-dashboard/doctor-dashboard.component';
import {DoctorProfileSetupComponent} from './components/doctor/doctor-profile-setup/doctor-profile-setup.component';
import {PatientProfileSetupComponent} from './components/patient/patient-profile-setup/patient-profile-setup.component';
import {MedicalRecordComponent} from './components/medicalRecord/medical-record/medical-record.component';
import {
  PatientProfileComponent
} from './components/patient/patient-profile-component/patient-profile.component';
import {PatientAppointmentComponent} from './components/appointment/patient-appointment/patient-appointment.component';
import {PrescriptionsComponent} from './components/prescription/prscriptions/prescriptions.component';
import {AiAgentComponent} from './components/ai-agent/ai-agent.component';
import {FindDoctorComponent} from './components/searchDoctor/find-doctor/find-doctor.component';
import {DoctorProfileComponent} from './components/doctor/doctor-profile/doctor-profile.component';
const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'patient',
    canActivate: [AuthGuard],
    data: {role: 'patient'},
    children: [
      {
        path: 'patient-dashboard',
        component: PatientDashboardComponent,
        data: { title: 'Dashboard' }
      },
      {
        path: 'patient-view-profile',
        component: PatientProfileComponent,
        data: { title: 'My Profile' }
      },
      {
        path: 'patient-profile-setup',
        component: PatientProfileSetupComponent,
        data: { title: 'Complete Profile' }
      },
      {
        path: 'appointments',
        component: PatientAppointmentComponent,
        data: { title: 'Appointments' }
      },
      {
        path: 'medical-records',
        component: MedicalRecordComponent,
        data: { title: 'Medical Records' }
      },
      {
        path: 'prescriptions',
        component: PrescriptionsComponent,
        data: { title: 'Prescriptions' }
      },
      {
      path: 'ai-agent',
        component: AiAgentComponent,
        data: {title: 'AiAgent'}
      },
      {
        path: 'find-doctor',
        component: FindDoctorComponent,
        data: { title: 'Find Doctor' }
      },
      {
        path: '',
        redirectTo: '/patient-dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'doctor',
    canActivate: [AuthGuard],
    data: {role: 'doctor'},
    children: [
      {
        path: 'doctor-profile-setup',
        component: DoctorProfileSetupComponent,
        data: { title: 'Complete Profile' }
      },
      {
        path: 'doctor-dashboard',
        component: DoctorDashboardComponent,
        data: { title: 'Dashboard' }
      },
      {
        path: ':id/profile',
        component: DoctorProfileComponent,
        data: { title: 'Profile' }
      },
      {
        path: '',
        redirectTo: '/doctor-dashboard',
        pathMatch: 'full'
      }
    ]
  },

  { path: '**', redirectTo: '/login' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
