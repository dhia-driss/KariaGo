import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient, HttpRequest } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor.service';
import { AuthService } from './auth.service';
import { Observable, of, throwError } from 'rxjs';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authService: AuthService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    localStorageSpy = jasmine.createSpyObj('Storage', ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: Storage, useValue: localStorageSpy }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding requests
  });

  it('should add an Authorization header if token is present', () => {
    localStorageSpy.getItem.and.returnValue('mockAccessToken');

    httpClient.get('/test-endpoint').subscribe(response => {
      expect(response).toBeTruthy();
    });

    const httpRequest = httpMock.expectOne('/test-endpoint');
    expect(httpRequest.request.headers.has('Authorization')).toBeTrue();
    expect(httpRequest.request.headers.get('Authorization')).toBe('Bearer mockAccessToken');
  });

  it('should not add an Authorization header if no token is present', () => {
    localStorageSpy.getItem.and.returnValue(null);

    httpClient.get('/test-endpoint').subscribe(response => {
      expect(response).toBeTruthy();
    });

    const httpRequest = httpMock.expectOne('/test-endpoint');
    expect(httpRequest.request.headers.has('Authorization')).toBeFalse();
  });

  it('should refresh token and retry request if token is expired (401 response)', () => {
    localStorageSpy.getItem.and.returnValue('mockExpiredAccessToken');
    const refreshTokenSpy = spyOn(authService, 'refreshAccessToken').and.returnValue(
      of({ accessToken: 'newAccessToken' })
    );

    httpClient.get('/test-endpoint').subscribe(response => {
      expect(response).toBeTruthy();
    });

    const request1 = httpMock.expectOne('/test-endpoint');
    request1.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(refreshTokenSpy).toHaveBeenCalled();

    const request2 = httpMock.expectOne('/test-endpoint');
    expect(request2.request.headers.get('Authorization')).toBe('Bearer newAccessToken');
  });

  it('should log out if refresh token request fails', () => {
    localStorageSpy.getItem.and.returnValue('mockExpiredAccessToken');
    spyOn(authService, 'refreshAccessToken').and.returnValue(throwError(() => new Error('Refresh Token Expired')));
    const logoutSpy = spyOn(authService, 'logout');

    httpClient.get('/test-endpoint').subscribe({
      error: err => {
        expect(err).toBeTruthy();
      }
    });

    const request1 = httpMock.expectOne('/test-endpoint');
    request1.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(logoutSpy).toHaveBeenCalled();
  });
});
