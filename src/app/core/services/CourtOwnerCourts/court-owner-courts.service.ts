import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class CourtOwnerCourtsService {

  constructor(private readonly httpClient: HttpClient) { }
  AddCourt(mainCourtId: string, data: any): Observable<any> {
    return this.httpClient.post(environments.baseUrl + `/owner/maincourts/${mainCourtId}/courts`, data);
  }
  ShowAllCourt(mainCourtId: any): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/owner/maincourts/${mainCourtId}/courts`);
  }
  ShowSpecificCourt(mainCourtId: string, courtId: string): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/owner/maincourts/${mainCourtId}/courts/${courtId}`);
  }
  UpdateCourt(mainCourtId: string, courtId: string, data: any): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/owner/maincourts/${mainCourtId}/courts/${courtId}`, data);
  }
  DeleteCourt(mainCourtId: string, courtId: string): Observable<any> {
    return this.httpClient.delete(environments.baseUrl + `/owner/maincourts/${mainCourtId}/courts/${courtId}`);
  }
}
