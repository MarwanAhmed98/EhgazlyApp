import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminManageCourtsService {

  constructor(private readonly httpClient: HttpClient) { }
  VerifyCourt(MainCourtId: string | number): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/maincourts/${MainCourtId}/verify`, {});
  }
  ShowAllCourts(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/admin/maincourts');
  }
  ShowSpecificCourt(MainCourtId: string): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/admin/maincourts/${MainCourtId}`);
  }
  SuspendCourt(MainCourtId: string | number): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/maincourts/${MainCourtId}/suspend`, {});
  }
}
