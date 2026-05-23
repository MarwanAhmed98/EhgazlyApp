import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerTimeslotService {

  constructor(private readonly httpClient: HttpClient) { }
  GetCustomerTimeSlot(courtId: number, selectedDate: string): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/customer/courts/${courtId}/timeslots?date=${selectedDate}`)
  }
  GetSpecificCourt(mainCourtId: number): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/customer/maincourts/${mainCourtId}/courts/1`)
  }
}
