export interface Booking {
    _id: string;
    id_user: string;
    id_car: string;
    date_hour_booking: Date;
    date_hour_expire: Date;
    current_Key_car?: string;
    image?: string;
    status: boolean;
    contrat?: string;
    paiement?: number;
    location_Before_Renting?: string;
    location_After_Renting?: string;
    estimated_Location?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  