import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-car-location',
  standalone: false,
  templateUrl: './car-location.component.html',
  styleUrls: ['./car-location.component.css']
})
export class CarLocationComponent implements OnInit {
  center: google.maps.LatLngLiteral = { lat: 36.8065, lng: 10.1815 }; // Default center (Tunis, for example)
  zoom = 8;
  markers: any[] = [];

  selectedCar: any = null;
  selectedPosition: google.maps.LatLngLiteral = this.center;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCarMarkers();
  }

  loadCarMarkers(): void {
    this.http.get<any[]>(`${environment.apiBaseUrl}/cars`).subscribe(cars => {
      this.markers = cars.map(car => {
        const [latStr, lngStr] = car.location.split(',').map((coord: string) => coord.trim());
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        return {
          position: { lat, lng },
          label: car.matricule,
          car: car
        };
      });
    });
  }

  selectCar(marker: any): void {
    this.selectedCar = marker.car;
    this.selectedPosition = marker.position;
  }
}
