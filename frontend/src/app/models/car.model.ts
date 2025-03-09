export interface Car {
    _id: string;
    matricule: string;
    marque: string;
    panne: string;
    panne_ia: string[];
    location: string;
    visite_technique: Date;
    car_work: boolean;
    date_assurance: Date;
    vignette: Date;
    diagnostique_vidange: {
      vidange1?: Date;
      vidange2?: Date;
      vidange3?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
  }
  