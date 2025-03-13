import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  totalUsers = 0;
  loading: boolean = true;
  error: string | null = null;
  searchQuery: string = ''; // ✅ Added missing searchQuery
  isAdding: boolean = false;
  isEditing: boolean = false;
  selectedUser: User | null = null;

  newUser: User = {
    _id: '',
    cin: '',
    permis: '',
    num_phone: '',
    email: '',
    facture: 0,
    nbr_fois_allocation: 0,
    blacklisted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.totalUsers = data.length;
        this.loading = false;
        this.applyFilters();
      },
      error: (err) => {
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  // 🔹 Apply search filter
  applyFilters(): void {
    this.users = this.users.filter(user =>
      user.cin.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // 🔹 Select a user for viewing/editing
  selectUser(user: User): void {
    this.selectedUser = { ...user };
    this.isEditing = false;
  }

  // 🔹 Toggle Add User Widget
  toggleAddUser(): void {
    this.isAdding = !this.isAdding;
    this.isEditing = false;
    this.selectedUser = null;
  }

  // 🔹 Add a new user
  addUser(): void {
    this.userService.addUser(this.newUser).subscribe(
      (addedUser) => {
        this.users.unshift(addedUser);
        this.isAdding = false;
      },
      (error) => {
        console.error('Error adding user:', error);
      }
    );
  }

  // 🔹 Toggle Edit Mode
  toggleEditMode(): void {
    this.isEditing = !this.isEditing;
  }

  // 🔹 Save User Updates
  updateUser(): void {
    if (this.selectedUser) {
      this.userService.updateUser(this.selectedUser._id, this.selectedUser).subscribe(
        (updatedUser) => {
          const index = this.users.findIndex(user => user._id === updatedUser._id);
          if (index !== -1) {
            this.users[index] = updatedUser;
          }
          this.isEditing = false;
        },
        (error) => {
          console.error('Error updating user:', error);
        }
      );
    }
  }

  // 🔹 Delete User
  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(user => user._id !== id);
        this.totalUsers--;
      });
    }
  }
}
