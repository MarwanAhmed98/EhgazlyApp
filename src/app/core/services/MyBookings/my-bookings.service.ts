import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class MyBookingsService {

  constructor(private readonly httpClient: HttpClient) { }
  GetShowBooking(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/customer/bookings')
  }
  GetSpecificBooking(bookingId: string): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/customer/bookings/${bookingId}`)
  }
  CancelBooking(bookingId: string): Observable<any> {
    return this.httpClient.delete(environments.baseUrl + `/customer/bookings/${bookingId}`)
  }

}
