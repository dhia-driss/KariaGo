import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-car-location',
  standalone: false,
  templateUrl: './car-location.component.html',
  styleUrls: ['./car-location.component.css']
})
export class CarLocationComponent implements OnInit {
  zoom = 8;
  center: google.maps.LatLngLiteral = { lat: 36.8065, lng: 10.1815 };
  markers = [
    {
      position: { lat: 36.8065, lng: 10.1815 },
      label: 'Car 1',
      title: 'Available'
    },
    {
      position: { lat: 35.8256, lng: 10.6084 },
      label: 'Car 2',
      title: 'On Rent'
    }
  ];

  ngOnInit(): void {}
}
