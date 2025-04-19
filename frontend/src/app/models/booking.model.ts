export interface Booking {
  _id: string; // Added the missing _id property
  id_user: string;
  id_car: string;
  date_hour_booking: Date;
  date_hour_expire: Date;
  paiement: number;
  status: boolean;
  current_Key_car: string;
  contrat: string;
  estimated_Location: string;
  location_Before_Renting: string;
  location_After_Renting: string;
  image: string;
}
