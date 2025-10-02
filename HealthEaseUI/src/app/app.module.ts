import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import {FormsModule} from '@angular/forms';
import { LoginComponent } from './components/components/auth/login/login.component';
import { RegisterComponent } from './components/components/auth/register/register.component';
import { PatientDashboardComponent } from './components/components/patient/patient-dashboard/patient-dashboard.component';
import { DoctorDashboardComponent } from './components/components/doctor/doctor-dashboard/doctor-dashboard.component';
import {AuthService} from './services/authService/auth.service';
import {AuthGuard} from './gaurd/guards/auth.guard';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthInterceptor} from './interceptors/auth.interceptor';
import {AppComponent} from './app.component';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import { PatientProfileSetupComponent } from './components/components/patient/patient-profile-setup/patient-profile-setup.component';
import { DoctorProfileSetupComponent } from './components/components/doctor/doctor-profile-setup/doctor-profile-setup.component';
import { PatientProfileComponentComponent } from './components/components/patient/patient-profile-component/patient-profile-component.component';
import { NavigationHeaderComponent } from './components/components/navigationBar/navigation-header/navigation-header.component';
import { MedicalRecordComponent } from './components/components/medicalRecord/medical-record/medical-record.component';
import { PrescriptionsComponent } from './components/components/prescription/prscriptions/prescriptions.component';
import { PatientAppointmentComponent } from './components/components/appointment/patient-appointment/patient-appointment.component';
import { AiAgentComponent } from './components/components/ai-agent/ai-agent.component';

@NgModule({
  declarations: [
    LoginComponent,
       RegisterComponent,
       PatientDashboardComponent,
       DoctorDashboardComponent,
    AppComponent,
    PatientProfileSetupComponent,
    DoctorProfileSetupComponent,
    PatientProfileComponentComponent,
    NavigationHeaderComponent,
    MedicalRecordComponent,
    PrescriptionsComponent,
    PatientAppointmentComponent,
    AiAgentComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
      RouterModule,
      ReactiveFormsModule,
      HttpClientModule
    ],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
