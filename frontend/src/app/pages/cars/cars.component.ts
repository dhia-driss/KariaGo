import { Component, OnInit } from '@angular/core';
import { CarService } from '../../services/car.service';
import { UserService } from '../../services/user.service';
import { BookingService } from '../../services/booking.service';
import { ReclamationService } from '../../services/reclamation.service';
import { Car } from '../../models/car.model';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-cars',
  standalone: false, // 🔹 Force Angular to see it as a non-standalone component
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.css']
})
export class CarsComponent implements OnInit {
  cars: Car[] = [];
  filteredCars: Car[] = [];
  loading: boolean = true;
  error: string | null = null;
  searchQuery: string = '';
  filterStatus: string = 'all';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  isEditing: boolean = false;
  isAdding: boolean = false;

  // 🔹 Dashboard Statistics
  totalUsers: number = 0;
  totalCars: number = 0;
  activeBookings: number = 0;
  openReclamations: number = 0;

  // 🔹 Selected Car for Details Widget
  selectedCar: Car | null = null;
  selectedCarBooking: Booking | null = null;

  // 🔹 New Car Object for Adding
  newCar: Car = {
    _id: '',
    matricule: '',
    marque: '',
    panne: '',
    panne_ia: [],
    location: '',
    visite_technique: undefined,
    car_work: false,
    date_assurance: undefined,
    vignette: undefined,
    diagnostique_vidange: {
      vidange1: undefined,
      vidange2: undefined,
      vidange3: undefined,
    }
  };

  constructor(
    private carService: CarService,
    private userService: UserService,
    private bookingService: BookingService,
    private reclamationService: ReclamationService
  ) {}

  ngOnInit() {
    this.loadCarData();
    this.loadStatistics();
  }

  // 🔹 Fetch Car Data
  loadCarData() {
    this.loading = true;
    this.carService.getAllCars().subscribe(
      (data: Car[]) => {
        this.cars = data;
        this.applyFilters(); // Apply filters after fetching data
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to load cars';
        this.loading = false;
      }
    );
  }

  // 🔹 Load Dashboard Statistics
  loadStatistics() {
    this.userService.getAllUsers().subscribe(users => {
      this.totalUsers = users.length;
    });

    this.carService.getAllCars().subscribe(cars => {
      this.totalCars = cars.length;
    });

    this.bookingService.getAllBookings().subscribe(bookings => {
      this.activeBookings = bookings.filter(b => b.status).length; // Count active bookings
    });

    this.reclamationService.getAllReclamations().subscribe(reclamations => {
      this.openReclamations = reclamations.length;
    });
  }

  // 🔹 Apply Search and Filter
  applyFilters() {
    this.filteredCars = this.cars.filter(car => {
      const matchesSearch =
        car.matricule.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        car.marque.toLowerCase().includes(this.searchQuery.toLowerCase());

      const matchesFilter =
        this.filterStatus === 'all' ||
        (this.filterStatus === 'running' && car.car_work) ||
        (this.filterStatus === 'not-working' && !car.car_work);

      return matchesSearch && matchesFilter;
    });
  }

  // 🔹 Select a Car to View Details
  selectCar(car: Car): void {
    if (!car._id) {
      console.error('Car ID is undefined.');
      return;
    }

    this.selectedCar = { ...car }; // Clone to avoid direct mutation
    this.isEditing = false;
    this.isAdding = false;
    this.fetchCarBooking(car._id); // Safe to call now
  }

  // 🔹 Fetch Car Booking Details
  fetchCarBooking(carId: string | undefined): void {
    if (!carId) {
      console.error('Car ID is undefined.');
      return;
    }

    this.bookingService.getAllBookings().subscribe(bookings => {
      this.selectedCarBooking = bookings.find(b => b.id_car === carId) || null;
    });
  }

  // 🔹 Toggle Edit Mode
  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
  }

  // 🔹 Toggle Add Car Mode
  toggleAddCar(): void {
    this.isAdding = !this.isAdding;
    this.isEditing = false;
    this.selectedCar = null;
  }

  // 🔹 Save Updated Car Information
  saveCarChanges(): void {
    if (!this.selectedCar || !this.selectedCar._id) {
      console.error('Selected car or car ID is undefined.');
      return;
    }

    this.carService.updateCar(this.selectedCar._id, this.selectedCar).subscribe(
      (updatedCar) => {
        const index = this.cars.findIndex(car => car._id === updatedCar._id);
        if (index !== -1) {
          this.cars[index] = updatedCar;
          this.selectedCar = null;
this.isEditing = false;
this.applyFilters();

        }
        this.isEditing = false;
      },
      (error) => {
        console.error('Error updating car:', error);
      }
    );
  }

  // 🔹 Add a New Car
  addCar(): void {
    if (!this.newCar.matricule || !this.newCar.marque || !this.newCar.location) {
      alert('Matricule, Marque, and Location are required.');
      return;
    }

    const carToAdd = { ...this.newCar };
    (carToAdd as any)._id = undefined; // Remove `_id` field

    this.carService.addCar(carToAdd).subscribe(
      (addedCar) => {
        this.cars.unshift(addedCar);
        this.isAdding = false;
        this.newCar = this.createEmptyCar(); // Reset the form
      },
      (error) => {
        console.error('Error adding car:', error);
        alert(error.error?.message || 'Failed to add car. Please try again.');
      }
    );
  }

  // 🔹 Remove Car
  removeCar(carId?: string): void {
    this.carService.deleteCar(carId ?? this.selectedCar?._id!).subscribe(() => {
      this.cars = this.cars.filter(car => car._id !== carId);
      this.selectedCar = null;
    },
    (error) => {
      console.error('Error removing car:', error);
    });
  }

  // 🔹 Close Car Details View
  closeCarDetails(): void {
    this.selectedCar = null;
    this.selectedCarBooking = null;
    this.isEditing = false;
    this.isAdding = false;
  }

  // 🔹 Create an Empty Car Object
  private createEmptyCar(): Car {
    return {
      _id: undefined, // `_id` is optional, so `undefined` is valid
      matricule: '',
      marque: '',
      panne: '',
      panne_ia: [],
      location: '',
      visite_technique: undefined,
      car_work: false,
      date_assurance: undefined,
      vignette: undefined,
      diagnostique_vidange: {
        vidange1: undefined,
        vidange2: undefined,
        vidange3: undefined,
      }
    };
  }
}