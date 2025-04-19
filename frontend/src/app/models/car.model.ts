export interface Car {
  _id?: string; // Make `_id` optional
  matricule: string;
  marque: string;
  panne?: string; // Optional
  panne_ia?: string[]; // Optional AI-detected issues
  location: string;
  visite_technique?: Date; // Optional Technical Visit Date
  car_work: boolean;
  date_assurance?: Date; // Optional Insurance Date
  vignette?: Date; // Optional Vignette Date
  diagnostique_vidange: {
    vidange1?: Date;
    vidange2?: Date;
    vidange3?: Date;
  };
  id_car?: string; // ✅ Added for referencing in bookings
  createdAt?: Date; // Optional timestamp
  updatedAt?: Date; // Optional timestamp
}
