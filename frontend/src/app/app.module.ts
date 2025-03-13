import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router'; // ✅ Add this import
import { AppRoutingModule } from './app-routing.module';

// Components
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';

// Services & Interceptors
import { AuthService } from './services/auth.service';
import { AuthInterceptor } from './services/auth.interceptor.service';
import { CarLocationComponent } from './pages/car-location/car-location.component';
import { CarsComponent } from './pages/cars/cars.component';
import { UsersComponent } from './pages/users/users.component';
import { BookingsComponent } from './pages/bookings/bookings.component';
import { ReclamationsComponent } from './pages/reclamations/reclamations.component';
import { UserPanelComponent } from './pages/user-panel/user-panel.component';

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
    RouterModule // ✅ Ensure RouterModule is imported
  ],
  providers: [
    AuthService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
