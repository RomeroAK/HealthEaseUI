import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AuthGuard} from './gaurd/guards/auth.guard';
import {LoginComponent} from './components/components/auth/login/login.component';
import {RegisterComponent} from './components/components/auth/register/register.component';
import {PatientDashboardComponent} from './components/components/patient/patient-dashboard/patient-dashboard.component';
import {DoctorDashboardComponent} from './components/components/doctor/doctor-dashboard/doctor-dashboard.component';
import {DoctorProfileSetupComponent} from './components/components/doctor/doctor-profile-setup/doctor-profile-setup.component';
import {PatientProfileSetupComponent} from './components/components/patient/patient-profile-setup/patient-profile-setup.component';
import {MedicalRecordComponent} from './components/components/medicalRecord/medical-record/medical-record.component';
import {
  PatientProfileComponentComponent
} from './components/components/patient/patient-profile-component/patient-profile-component.component';
import {PatientAppointmentComponent} from './components/components/appointment/patient-appointment/patient-appointment.component';
import {PrescriptionsComponent} from './components/components/prescription/prscriptions/prescriptions.component';
import {AiAgentComponent} from './components/components/ai-agent/ai-agent.component';
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
        component: PatientProfileComponentComponent,
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
        path: '',
        redirectTo: '/patient-dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'doctor-profile-setup',
    component: DoctorProfileSetupComponent,
    canActivate: [AuthGuard],
    data: { role: 'doctor' }
  },
  {
    path: 'doctor-dashboard',
    component: DoctorDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'doctor' }
  },
  { path: '**', redirectTo: '/login' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
