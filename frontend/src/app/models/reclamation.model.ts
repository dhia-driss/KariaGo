// 1. ✅ Update `reclamation.model.ts`

export interface Reclamation {
  _id: string;
  id_user: string | { _id: string; fullName: string }; // Support populated user
  message: string;
  date_created: Date;
  createdAt: Date;
  updatedAt: Date;
}