import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CourtOwnerWorkingHoursService {
  constructor(private readonly httpClient: HttpClient) { }

  AddWorkHours(maincourtId: string, workingHoursData: any): Observable<any> {
    return this.httpClient.post(environments.baseUrl + `/owner/maincourts/${maincourtId}/working-hours`, workingHoursData)
  }
  ShowWorkingHours(maincourtId: string): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/owner/maincourts/${maincourtId}/working-hours`)
  }
}
