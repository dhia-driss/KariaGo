import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { BookingService } from '../services/booking.service';
import { CarService } from '../services/car.service';
import { ReclamationService } from '../services/reclamation.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [HttpClientTestingModule],
      providers: [AuthService, BookingService, CarService, ReclamationService, UserService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch dashboard stats on init', () => {
    spyOn(component, 'loadDashboardStats').and.callThrough();
    component.ngOnInit();
    expect(component.loadDashboardStats).toHaveBeenCalled();
  });
});
