import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { GoogleMapsModule } from '@angular/google-maps';

// Components
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { CarLocationComponent } from './pages/car-location/car-location.component';
import { CarsComponent } from './pages/cars/cars.component';
import { UsersComponent } from './pages/users/users.component';
import { BookingsComponent } from './pages/bookings/bookings.component';
import { ReclamationsComponent } from './pages/reclamations/reclamations.component';
import { UserPanelComponent } from './pages/user-panel/user-panel.component';

// Services & Interceptors
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './services/auth.interceptor.service';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    CarLocationComponent,
    CarsComponent,
    UsersComponent,
    BookingsComponent,
    ReclamationsComponent,
    UserPanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    GoogleMapsModule
  ],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
