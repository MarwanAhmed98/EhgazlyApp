import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  constructor(private readonly httpClient: HttpClient) { }
  DashboardOverview(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/admin/dashboard')
  }
}
