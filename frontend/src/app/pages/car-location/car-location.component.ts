import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-car-location',
  standalone: false,
  templateUrl: './car-location.component.html',
  styleUrls: ['./car-location.component.css']
})
export class CarLocationComponent implements AfterViewInit {
  private map: L.Map | undefined;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
    }, 500); // Small delay to ensure proper rendering
  }

  private initMap(): void {
    this.map = L.map('map').setView([36.8065, 10.1815], 13); // Default to Tunisia

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add a marker for testing
    L.marker([36.8065, 10.1815]).addTo(this.map)
      .bindPopup('Test Car Location')
      .openPopup();

    setTimeout(() => {
      this.map?.invalidateSize(); // Forces map to reload tiles properly
    }, 500);
  }
}
