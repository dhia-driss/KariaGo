import { Component, OnInit } from '@angular/core';
import { ReclamationService } from '../../services/reclamation.service';
import { Reclamation } from '../../models/reclamation.model';
import { UserService } from '../../services/user.service';
import { CarService } from '../../services/car.service';
import { BookingService } from '../../services/booking.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-reclamations',
  standalone: false,
  templateUrl: './reclamations.component.html',
  styleUrls: ['./reclamations.component.css']
})
export class ReclamationsComponent implements OnInit {
  reclamations: Reclamation[] = [];
  totalUsers = 0;
  totalCars = 0;
  activeBookings = 0;
  openReclamations = 0;
  loading: boolean = true;
  error: string | null = null;

  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUserName: string = '';

  selectedReclamation: Reclamation | null = null;
  editableReclamation: {
    _id: string;
    message: string;
    id_user: string;
  } | null = null;

  editMode: boolean = false;

  newReclamationOpen: boolean = false;
  newReclamation: {
    id_user: string;
    message: string;
    date_created: Date;
  } = this.createEmptyReclamation();

  constructor(
    private reclamationService: ReclamationService,
    private userService: UserService,
    private carService: CarService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.fetchReclamations();
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Loaded Users:', this.users);
      },
      error: (err) => {
        console.error('Failed to load users:', err);
      }
    });
  }

  onUserSearch(input: string): void {
    if (!this.users || this.users.length === 0) {
      console.warn('User list is empty or not loaded yet.');
      this.filteredUsers = [];
      return;
    }

    const query = input.toLowerCase().trim();
    this.filteredUsers = this.users
      .filter(user => user.fullName?.toLowerCase().includes(query))
      .slice(0, 5);

    console.log('Filtered Users:', this.filteredUsers);
  }

  selectUser(user: User): void {
    this.newReclamation.id_user = user._id;
    this.selectedUserName = user.fullName;
    this.filteredUsers = [];
  }

  loadDashboardStats(): void {
    this.userService.getAllUsers().subscribe(users => this.totalUsers = users.length);
    this.carService.getAllCars().subscribe(cars => this.totalCars = cars.length);
    this.bookingService.getAllBookings().subscribe(bookings => {
      this.activeBookings = bookings.filter(b => b.status).length;
    });
    this.reclamationService.getAllReclamations().subscribe(recs => this.openReclamations = recs.length);
  }

  fetchReclamations(): void {
    this.reclamationService.getAllReclamations().subscribe({
      next: (data) => {
        this.reclamations = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load reclamations';
        this.loading = false;
      }
    });
  }

  viewReclamation(reclamation: Reclamation): void {
    this.selectedReclamation = reclamation;
    this.editableReclamation = {
      _id: reclamation._id,
      message: reclamation.message,
      id_user: typeof reclamation.id_user === 'string' ? reclamation.id_user : reclamation.id_user._id
    };
    this.editMode = false;
  }

  closeReclamationDetails(): void {
    this.selectedReclamation = null;
    this.editableReclamation = null;
    this.editMode = false;
  }

  saveReclamationChanges(): void {
    if (!this.editableReclamation || !this.editableReclamation._id) return;

    this.reclamationService.updateReclamation(this.editableReclamation._id, {
      message: this.editableReclamation.message
    }).subscribe({
      next: () => {
        const index = this.reclamations.findIndex(r => r._id === this.editableReclamation!._id);
        if (index !== -1 && this.editableReclamation) {
          this.reclamations[index].message = this.editableReclamation.message;
        }
        this.closeReclamationDetails();
      },
      error: () => {
        alert('Failed to update reclamation.');
      }
    });
  }

  openNewReclamation(): void {
    this.newReclamationOpen = true;
    this.newReclamation = this.createEmptyReclamation();
    this.selectedUserName = '';
    this.filteredUsers = [];
  }

  closeNewReclamation(): void {
    this.newReclamationOpen = false;
    this.newReclamation = this.createEmptyReclamation();
    this.selectedUserName = '';
  }

  saveNewReclamation(): void {
    if (!this.newReclamation.id_user || !this.newReclamation.message) {
      alert('Please select a user and enter a message.');
      return;
    }

    this.reclamationService.addReclamation(this.newReclamation).subscribe({
      next: (reclamation) => {
        this.reclamations.push(reclamation);
        this.closeNewReclamation();
      },
      error: (err) => {
        console.error('Failed to create reclamation:', err);
        alert('Failed to create reclamation.');
      }
    });
  }

  deleteReclamation(id: string): void {
    if (confirm('Are you sure you want to delete this reclamation?')) {
      this.reclamationService.deleteReclamation(id).subscribe(() => {
        this.reclamations = this.reclamations.filter(r => r._id !== id);
      });
    }
  }

  private createEmptyReclamation() {
    return {
      id_user: '',
      message: '',
      date_created: new Date()
    };
  }

  getFullName(user: any): string {
    if (user && typeof user === 'object' && 'fullName' in user) {
      return user.fullName;
    }
    return user;
  }
}
