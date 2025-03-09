import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false, // 🔹 Force Angular to see it as a non-standalone component
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'KariaGo Admin Panel';
}
