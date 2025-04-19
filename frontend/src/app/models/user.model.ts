export interface User {
  _id: string;
  cin: string;                        // Image URL
  permis: string;                     // Image URL
  num_phone: string;
  email: string;
  fullName: string;                   // Full name of the user
  password?: string;                  // Optional in updates, required on creation
  facture: number;
  nbr_fois_allocation: number;
  blacklist: boolean;
  iD_Booking: string[];              // Array of ObjectId references (as strings)
  createdAt: Date;
  updatedAt: Date;
}
