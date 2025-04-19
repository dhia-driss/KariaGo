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
  filteredUsers: User[] = [];
  totalUsers = 0;
  loading = true;
  error: string | null = null;
  searchQuery = '';
  isAdding = false;
  isEditing = false;
  isLoadingAction = false;

  selectedUser: User | null = null;
  newUser: User = this.createEmptyUser();

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
      error: () => {
        this.error = 'Failed to load users';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.fullName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.cin?.toLowerCase().includes(query)
    );
  }

  toggleAddUser(): void {
    this.isAdding = !this.isAdding;
    this.isEditing = false;
    this.selectedUser = null;
    this.resetNewUser();
  }

  addUser(): void {
    if (!this.newUser.fullName || !this.newUser.cin || !this.newUser.permis ||
        !this.newUser.num_phone || !this.newUser.email || !this.newUser.password) {
      alert('All fields are required.');
      return;
    }

    this.isLoadingAction = true;
    const userToAdd = { ...this.newUser };
    (userToAdd as any)._id = undefined;

    this.userService.addUser(userToAdd).subscribe({
      next: (addedUser) => {
        this.users.unshift(addedUser);
        this.totalUsers++;
        this.isAdding = false;
        this.resetNewUser();
        this.applyFilters();
        this.isLoadingAction = false;
      },
      error: (error) => {
        console.error('Error adding user:', error);
        alert(error.error?.message || 'Failed to add user. Please try again.');
        this.isLoadingAction = false;
      }
    });
  }

  selectUser(user: User): void {
    this.selectedUser = { ...user };
    this.isEditing = false;
  }

  updateUser(): void {
    if (!this.selectedUser) return;

    this.isLoadingAction = true;
    this.userService.updateUser(this.selectedUser._id, this.selectedUser).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u._id === updatedUser._id);
        if (index !== -1) this.users[index] = updatedUser;
        this.applyFilters();
        this.selectedUser = null;
        this.isLoadingAction = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        alert(error.error?.message || 'Failed to update user.');
        this.isLoadingAction = false;
      }
    });
  }
  modalImage: string | null = null;

  openImageModal(src: string): void {
    this.modalImage = src;
  }
  
  closeImageModal(): void {
    this.modalImage = null;
  }
  
  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(user => user._id !== id);
        this.totalUsers--;
        this.applyFilters();
      });
    }
  }

  onImageUpload(event: Event, type: 'cin' | 'permis'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'cin') {
        this.newUser.cin = reader.result as string;
      } else if (type === 'permis') {
        this.newUser.permis = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  onEditImageUpload(event: Event, type: 'cin' | 'permis'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.selectedUser) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'cin') {
        this.selectedUser!.cin = reader.result as string;
      } else if (type === 'permis') {
        this.selectedUser!.permis = reader.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  resetNewUser(): void {
    this.newUser = this.createEmptyUser();
  }

  private createEmptyUser(): User {
    return {
      _id: '',
      cin: '',
      permis: '',
      num_phone: '',
      email: '',
      fullName: '',
      password: '',
      facture: 0,
      nbr_fois_allocation: 0,
      blacklist: false,
      iD_Booking: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
