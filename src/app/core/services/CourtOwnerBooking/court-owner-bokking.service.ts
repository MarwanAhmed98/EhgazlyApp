import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class CourtOwnerBokkingService {

  constructor(private httpClient: HttpClient) { }
  GetAllBookings(): Observable<any> {
    return this.httpClient.get(`${environments.baseUrl}/owner/bookings`)
  }
  GetPendingBookings(): Observable<any> {
    return this.httpClient.get(`${environments.baseUrl}/owner/bookings?status=pending`)
  }
  GetSpecificBookings(id: string): Observable<any> {
    return this.httpClient.get(`${environments.baseUrl}/owner/bookings/${id}`)
  }
  ConfirmBookings(id: string): Observable<any> {
    return this.httpClient.put(`${environments.baseUrl}/owner/bookings/${id}/confirm`, {})
  }
  RejectBookings(id: string, rejectionReason: string): Observable<any> {
    return this.httpClient.put(`${environments.baseUrl}/owner/bookings/${id}/reject`,
      {
        "rejection_reason": rejectionReason
      }
    )
  }
}
