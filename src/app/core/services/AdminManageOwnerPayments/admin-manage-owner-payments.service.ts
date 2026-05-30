import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminManageOwnerPaymentsService {

  constructor(private readonly httpClient: HttpClient) { }
  ApprovePayments(OwnerId: string | number): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/owner-payments/${OwnerId}/approve`, {});
  }
  ShowAllPayments(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/admin/owner-payments');
  }
  ShowSpecificPayments(OwnerId: string | number): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/admin/owner-payments/${OwnerId}`);
  }
  RejectPayments(OwnerId: string | number): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/owner-payments/${OwnerId}/reject`, {});
  }
}
