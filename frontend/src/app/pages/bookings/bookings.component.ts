import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';
import { UserService } from '../../services/user.service';
import { CarService } from '../../services/car.service';
import { ReclamationService } from '../../services/reclamation.service';

@Component({
  selector: 'app-bookings',
  standalone: false,
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  totalUsers = 0;
  totalCars = 0;
  activeBookings = 0;
  openReclamations = 0;
  loading: boolean = true;
  error: string | null = null;
  selectedBooking: Booking | null = null;
  editableBooking: Booking = this.createEmptyBooking(); // Initialize to prevent null errors
  editMode: boolean = false; // Track if the form is in edit mode

  constructor(
    private bookingService: BookingService,
    private userService: UserService,
    private carService: CarService,
    private reclamationService: ReclamationService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.fetchBookings();
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

  fetchBookings(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load bookings';
        this.loading = false;
      }
    });
  }

  // Function to open booking details in view mode
  viewBooking(booking: Booking): void {
    this.selectedBooking = booking;
    this.editableBooking = { ...booking };
    this.editMode = false; // Start in read-only mode
  }

  // Function to close the booking details view
  closeBookingDetails(): void {
    this.selectedBooking = null;
    this.editableBooking = this.createEmptyBooking();
    this.editMode = false; // Reset edit mode
  }

  // Save changes to the booking
  saveBookingChanges(): void {
    if (!this.editableBooking || !this.editableBooking._id) return;

    this.bookingService.updateBooking(this.editableBooking._id, this.editableBooking).subscribe({
      next: () => {
        const index = this.bookings.findIndex(b => b._id === this.editableBooking._id);
        if (index !== -1) {
          this.bookings[index] = { ...this.editableBooking };
        }
        this.closeBookingDetails();
      },
      error: () => {
        alert('Failed to update booking.');
      }
    });
  }

  // Delete booking from details view
  deleteBooking(): void {
    if (!this.selectedBooking) return;

    if (confirm('Are you sure you want to delete this booking?')) {
      this.bookingService.deleteBooking(this.selectedBooking._id).subscribe({
        next: () => {
          this.bookings = this.bookings.filter(b => b._id !== this.selectedBooking?._id);
          this.closeBookingDetails();
        },
        error: () => {
          alert('Failed to delete booking.');
        }
      });
    }
  }
  newBookingOpen: boolean = false;
newBooking: Partial<Booking> = this.createEmptyBooking();

openNewBooking(): void {
  this.newBookingOpen = true;
  this.newBooking = this.createEmptyBooking();
}

closeNewBooking(): void {
  this.newBookingOpen = false;
}

saveNewBooking(): void {
  this.bookingService.addBooking(this.newBooking).subscribe({
    next: (booking) => {
      this.bookings.push(booking);
      this.closeNewBooking();
    },
    error: () => {
      alert('Failed to create booking.');
    }
  });
}


  // Enable edit mode
  enableEditMode(): void {
    this.editMode = true;
  }

  // Helper function to create an empty booking object to prevent null errors
  private createEmptyBooking(): Booking {
    return {
      _id: '',
      id_user: '',
      id_car: '',
      date_hour_booking: new Date(),
      date_hour_expire: new Date(),
      status: false,
      paiement: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
