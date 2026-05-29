import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class VenuesService {

  constructor(private readonly httpClient: HttpClient) { }
  // =============Maincourts==================
  GetAllCourts(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/customer/maincourts')
  }
  GetMainCourtes(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/customer/maincourts')
  }
  GetSpecificCourts(courtId: string): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/customer/maincourts/${courtId}`)
  }
  GetNearestCourts(latitude: number, longitude: number): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/customer/maincourts?latitude=${latitude}&longitude=${longitude}`)
  }
  // =========== Courts =======================
  GetCourts(mainCourtId: string | number): Observable<any> {
    return this.httpClient.get(`${environments.baseUrl}/customer/maincourts/${mainCourtId}/courts`);
  }
  GetSpecCourts(MainCourtId: string | number, courtId: string | number): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/customer/maincourts/${MainCourtId}/courts/${courtId}`)
  }

}
