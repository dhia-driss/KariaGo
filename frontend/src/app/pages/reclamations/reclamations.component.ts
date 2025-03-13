import { Component, OnInit } from '@angular/core';
import { ReclamationService } from '../../services/reclamation.service';
import { Reclamation } from '../../models/reclamation.model';
import { UserService } from '../../services/user.service';
import { CarService } from '../../services/car.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-reclamations',
  standalone: false, // 🔹 Force Angular to see it as a non-standalone component
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

  constructor(
    private reclamationService: ReclamationService,
    private userService: UserService,
    private carService: CarService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
    this.fetchReclamations();
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

  fetchReclamations(): void {
    this.reclamationService.getAllReclamations().subscribe({
      next: (data) => {
        this.reclamations = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load reclamations';
        this.loading = false;
      }
    });
  }
  selectedReclamation: any = null;
  editableReclamation: any = {};
  editMode: boolean = false;
  
  viewReclamation(reclamation: any): void {
    this.selectedReclamation = reclamation;
    this.editableReclamation = { ...reclamation };
    this.editMode = false;
  }
  
  closeReclamationDetails(): void {
    this.selectedReclamation = null;
    this.editMode = false;
  }
  
  saveReclamationChanges(): void {
    if (!this.editableReclamation || !this.editableReclamation._id) return;
  
    this.reclamationService.updateReclamation(this.editableReclamation._id, this.editableReclamation).subscribe({
      next: () => {
        const index = this.reclamations.findIndex(r => r._id === this.editableReclamation._id);
        if (index !== -1) {
          this.reclamations[index] = { ...this.editableReclamation };
        }
        this.closeReclamationDetails();
      },
      error: () => {
        alert('Failed to update reclamation.');
      }
    });
  }
  newReclamationOpen: boolean = false;
newReclamation: Partial<Reclamation> = this.createEmptyReclamation();

openNewReclamation(): void {
  this.newReclamationOpen = true;
  this.newReclamation = this.createEmptyReclamation();
}

closeNewReclamation(): void {
  this.newReclamationOpen = false;
}

saveNewReclamation(): void {
  this.reclamationService.addReclamation(this.newReclamation).subscribe({
    next: (reclamation) => {
      this.reclamations.push(reclamation);
      this.closeNewReclamation();
    },
    error: () => {
      alert('Failed to create reclamation.');
    }
  });
}

private createEmptyReclamation(): Partial<Reclamation> {
  return {
    id_user: '',
    message: '',
    date_created: new Date()
  };
}

  deleteReclamation(id: string): void {
    if (confirm('Are you sure you want to delete this reclamation?')) {
      this.reclamationService.deleteReclamation(id).subscribe(() => {
        this.reclamations = this.reclamations.filter(rec => rec._id !== id);
      });
    }
  }
}
