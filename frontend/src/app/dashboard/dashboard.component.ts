import { Component, OnInit } from '@angular/core'; 
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { BookingService } from '../services/booking.service';
import { CarService } from '../services/car.service';
import { ReclamationService } from '../services/reclamation.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-dashboard',
  standalone: false, // 🔹 Force Angular to see it as a non-standalone component

  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalUsers = 0;
  totalCars = 0;
  activeBookings = 0;
  openReclamations = 0;
  isDefaultView = true; // ✅ Track whether to show default content

  constructor(
    private authService: AuthService,
    private router: Router,
    private bookingService: BookingService,
    private carService: CarService,
    private reclamationService: ReclamationService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();

    // ✅ Detect route changes and toggle default content visibility
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const currentUrl = event.url;
        this.isDefaultView = currentUrl === '/admin' || currentUrl === '/admin/dashboard';
      }
    });
  }

  loadDashboardStats(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.totalUsers = users.length;
    });

    this.carService.getAllCars().subscribe(cars => {
      this.totalCars = cars.length;
    });

    this.bookingService.getAllBookings().subscribe(bookings => {
      this.activeBookings = bookings.filter(b => b.status).length;
    });

    this.reclamationService.getAllReclamations().subscribe(reclamations => {
      this.openReclamations = reclamations.length;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}