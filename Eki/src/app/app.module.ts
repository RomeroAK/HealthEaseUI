import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {FormsModule} from '@angular/forms';
import {LoginComponent} from './components/auth/login/login.component';
import {RegisterComponent} from './components/auth/register/register.component';
import {PatientDashboardComponent} from './components/patient/patient-dashboard/patient-dashboard.component';
import {DoctorDashboardComponent} from './components/doctor/doctor-dashboard/doctor-dashboard.component';
import {AuthService} from './services/authService/auth.service';
import {AuthGuard} from './gaurd/guards/auth.guard';
import {HTTP_INTERCEPTORS, provideHttpClient} from '@angular/common/http';
import {AuthInterceptor} from './interceptors/auth.interceptor';
import {AppComponent} from './app.component';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {
  PatientProfileSetupComponent
} from './components/patient/patient-profile-setup/patient-profile-setup.component';
import {
  DoctorProfileSetupComponent
} from './components/doctor/doctor-profile-setup/doctor-profile-setup.component';
import {
  PatientProfileComponent
} from './components/patient/patient-profile-component/patient-profile.component';
import {
  NavigationHeaderComponent
} from './components/navigationBar/navigation-header/navigation-header.component';
import {MedicalRecordComponent} from './components/medicalRecord/medical-record/medical-record.component';
import {PrescriptionsComponent} from './components/prescription/prscriptions/prescriptions.component';
import {
  PatientAppointmentComponent
} from './components/appointment/patient-appointment/patient-appointment.component';
import {AiAgentComponent} from './components/ai-agent/ai-agent.component';
import {FindDoctorComponent} from './components/patient/find-doctor/find-doctor.component';
import {DoctorProfileComponent} from './components/doctor/doctor-profile/doctor-profile.component';
import {AddAppointmentComponent} from './components/appointment/add-appointment/add-appointment.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    PatientDashboardComponent,
    DoctorDashboardComponent,
    AppComponent,
    PatientProfileSetupComponent,
    DoctorProfileSetupComponent,
    PatientProfileComponent,
    NavigationHeaderComponent,
    MedicalRecordComponent,
    PrescriptionsComponent,
    PatientAppointmentComponent,
    AiAgentComponent,
    FindDoctorComponent,
    DoctorProfileComponent,
    AddAppointmentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
