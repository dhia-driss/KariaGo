import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth.guard';
import { CarLocationComponent } from './pages/car-location/car-location.component';
import { CarsComponent } from './pages/cars/cars.component';
import { UsersComponent } from './pages/users/users.component';
import { BookingsComponent } from './pages/bookings/bookings.component';
import { ReclamationsComponent } from './pages/reclamations/reclamations.component';
import { UserPanelComponent } from './pages/user-panel/user-panel.component';

const routes: Routes = [
  // 🌐 **User Panel (Public)**
  { path: '', component: UserPanelComponent }, // Default Home → User Panel
  { path: 'user-panel', component: UserPanelComponent }, // Accessible without login
  { path: 'admin/login', component: LoginComponent }, // Admin Login

  // 🔐 **Admin Panel (Protected)**
  {
    path: 'admin',
    component: DashboardComponent,
    canActivate: [AuthGuard], // ✅ Protect entire admin section
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' }, // ✅ Redirect /admin → /admin/dashboard
      { path: 'dashboard', component: DashboardComponent }, // ✅ Shows dashboard stats as default
      { path: 'car-location', component: CarLocationComponent },
      { path: 'cars', component: CarsComponent },
      { path: 'users', component: UsersComponent },
      { path: 'bookings', component: BookingsComponent },
      { path: 'reclamations', component: ReclamationsComponent },
    ],
  },

  // Redirect to dashboard after login
  { path: 'login', component: LoginComponent },
  { path: 'admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },

  // 🛑 Redirect any unknown routes
  { path: '**', redirectTo: '/' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })], // ✅ Keeps hash navigation for better URL handling
  exports: [RouterModule]
})
export class AppRoutingModule { }
