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
  filteredBookings: Booking[] = [];
  users: any[] = [];
  cars: any[] = [];
  searchQuery: string = '';
  totalUsers: number = 0;
  totalCars: number = 0;
  activeBookings: number = 0;
  openReclamations: number = 0;
  loading: boolean = true;
  error: string | null = null;
  newBookingOpen: boolean = false;
  selectedUserName: string = '';
  selectedCarName: string = '';
  userSuggestions: any[] = [];
  carSuggestions: any[] = [];
  newBooking: Partial<Booking> = this.createEmptyBooking();
  selectedBooking: Booking | null = null;
  editMode: boolean = false;

  constructor(
    private bookingService: BookingService,
    private userService: UserService,
    private carService: CarService,
    private reclamationService: ReclamationService
  ) {}

  ngOnInit(): void {
    this.fetchBookings();
    this.loadUsers();
    this.loadCars();
    this.loadStatistics();
  }

  fetchBookings(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.filteredBookings = [...this.bookings];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load bookings';
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(users => this.users = users);
  }

  loadCars(): void {
    this.carService.getAllCars().subscribe(cars => this.cars = cars);
  }

  loadStatistics(): void {
    this.userService.getAllUsers().subscribe(users => this.totalUsers = users.length);
    this.carService.getAllCars().subscribe(cars => this.totalCars = cars.length);
    this.bookingService.getAllBookings().subscribe(bookings => {
      this.activeBookings = bookings.filter(b => b.status).length;
    });
    this.reclamationService.getAllReclamations().subscribe(recs => this.openReclamations = recs.length);
  }

  applyFilters(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredBookings = this.bookings.filter(booking => {
      const userName = this.getUserName(booking.id_user).toLowerCase();
      const carMatricule = this.getCarMatricule(booking.id_car).toLowerCase();
      return userName.includes(query) || carMatricule.includes(query);
    });
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u._id === userId);
    return user ? user.fullName : 'Unknown User';
  }

  getCarMatricule(carId: string): string {
    const car = this.cars.find(c => c._id === carId);
    return car ? car.matricule : 'Unknown Car';
  }

  openNewBooking(): void {
    this.newBookingOpen = true;
    this.newBooking = this.createEmptyBooking();
    this.selectedUserName = '';
    this.selectedCarName = '';
    this.userSuggestions = [];
    this.carSuggestions = [];
  }

  closeNewBooking(): void {
    this.newBookingOpen = false;
    this.newBooking = this.createEmptyBooking();
    this.selectedUserName = '';
    this.selectedCarName = '';
  }

  onUserSearch(input: string, type: 'new' | 'edit'): void {
    const query = input.toLowerCase().trim();
    this.userSuggestions = this.users.filter(user => user.fullName.toLowerCase().includes(query)).slice(0, 5);
  }

  onCarSearch(input: string, type: 'new' | 'edit'): void {
    const query = input.toLowerCase().trim();
    this.carSuggestions = this.cars.filter(car => car.matricule.toLowerCase().includes(query)).slice(0, 5);
  }

  selectUser(user: any, type: 'new' | 'edit'): void {
    if (type === 'new') {
      this.newBooking.id_user = user._id;
      this.selectedUserName = user.fullName;
    }
    this.userSuggestions = [];
  }

  selectCar(car: any, type: 'new' | 'edit'): void {
    if (type === 'new') {
      this.newBooking.id_car = car._id;
      this.selectedCarName = car.matricule;
    }
    this.carSuggestions = [];
  }

  onImageUpload(event: Event, type: 'new' | 'edit'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (type === 'new') {
      const reader = new FileReader();
      reader.onload = () => {
        this.newBooking.image = reader.result as string; // Convert file to Base64 string
      };
      reader.readAsDataURL(file);
    } else if (type === 'edit' && this.selectedBooking) {
      const reader = new FileReader();
      reader.onload = () => {
        if (this.selectedBooking) {
          this.selectedBooking.image = reader.result as string; // Convert file to Base64 string
        }
      };
      reader.readAsDataURL(file);
    }
  }

  onContractUpload(event: Event, type: 'new' | 'edit'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'new') this.newBooking.contrat = reader.result as string;
      else if (type === 'edit' && this.selectedBooking) this.selectedBooking.contrat = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  saveNewBooking(): void {
    if (!this.newBooking.id_user || !this.newBooking.id_car || !this.newBooking.date_hour_booking || !this.newBooking.date_hour_expire) {
      alert('Please fill in all required fields.');
      return;
    }
    this.bookingService.addBooking(this.newBooking).subscribe({
      next: (booking) => {
        this.bookings.push(booking);
        this.filteredBookings.push(booking);
        this.closeNewBooking();
      },
      error: () => alert('Failed to save booking.')
    });
  }

  viewBooking(booking: Booking): void {
    this.selectedBooking = { ...booking };
    this.editMode = false;
  }

  enableEditMode(): void {
    this.editMode = true;
  }

  closeBookingDetails(): void {
    this.selectedBooking = null;
    this.editMode = false;
  }

  saveBookingChanges(): void {
    if (!this.selectedBooking || !this.selectedBooking._id) return;
    const { id_user, id_car, ...updateFields } = this.selectedBooking;
    this.bookingService.updateBooking(this.selectedBooking._id, updateFields).subscribe({
      next: (updated) => {
        const index = this.bookings.findIndex(b => b._id === updated._id);
        if (index !== -1) {
          this.bookings[index] = updated;
          this.filteredBookings = [...this.bookings];
        }
        this.closeBookingDetails();
      },
      error: () => alert('Failed to update booking.')
    });
  }

  deleteBooking(): void {
    if (!this.selectedBooking || !this.selectedBooking._id) return;
    this.bookingService.deleteBooking(this.selectedBooking._id).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(b => b._id !== this.selectedBooking!._id);
        this.filteredBookings = [...this.bookings];
        this.closeBookingDetails();
        alert('Booking deleted successfully.');
      },
      error: () => alert('Failed to delete booking.')
    });
  }

  private createEmptyBooking(): Partial<Booking> {
    return {
      id_user: '',
      id_car: '',
      date_hour_booking: undefined,
      date_hour_expire: undefined,
      paiement: 0,
      status: false,
      current_Key_car: '',
      contrat: '',
      estimated_Location: '',
      location_Before_Renting: '',
      location_After_Renting: '',
      image: ''
    };
  }
}