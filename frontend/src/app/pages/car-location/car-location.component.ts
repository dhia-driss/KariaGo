import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MapInfoWindow } from '@angular/google-maps';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-car-location',
  standalone: false,
  templateUrl: './car-location.component.html',
  styleUrls: ['./car-location.component.css']
})
export class CarLocationComponent implements OnInit {
  center: google.maps.LatLngLiteral = { lat: 36.8065, lng: 10.1815 };
  zoom = 8;
  markers: any[] = [];

  selectedCar: any = null;
  selectedPosition: google.maps.LatLngLiteral = this.center;

  @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

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

        const iconUrl = car.car_work === true
          ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

        return {
          position: { lat, lng },
          label: car.matricule,
          car: car,
          options: {
            icon: { url: iconUrl }
          }
        };
      });
    });
  }

  selectCar(marker: any, infoWindow: MapInfoWindow): void {
    this.selectedPosition = marker.position;
    // Step 1: Get all bookings for this car
    this.http.get<any[]>(`${environment.apiBaseUrl}/bookings/car/${marker.car._id}`).subscribe(bookings => {
      if (bookings.length > 0) {
        // Step 2: Find the latest booking by date
        const latestBooking = bookings.sort((a, b) =>
          new Date(b.date_hour_booking).getTime() - new Date(a.date_hour_booking).getTime()
        )[0];

        // Step 3: Get the user fullName
        this.http.get<any>(`${environment.apiBaseUrl}/users/${latestBooking.id_user}`).subscribe(user => {
          this.selectedCar = {
            ...marker.car,
            fullName: user.fullName,
            date_hour_booking: latestBooking.date_hour_booking,
            date_hour_expire: latestBooking.date_hour_expire
          };
          infoWindow.open();
        }, () => {
          // User not found
          this.selectedCar = { ...marker.car };
          infoWindow.open();
        });
      } else {
        // No booking for this car
        this.selectedCar = { ...marker.car };
        infoWindow.open();
      }
    }, () => {
      // Error fetching bookings
      this.selectedCar = { ...marker.car };
      infoWindow.open();
    });
  }
}
