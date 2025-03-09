export interface User {
    _id: string;
    cin: string;
    permis: string;
    num_phone: string;
    facture: number;
    nbr_fois_allocation: number;
    blacklisted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  