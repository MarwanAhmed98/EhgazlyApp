import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class CourtOwnerPaymentService {

  constructor(private httpClient: HttpClient) { }
  GetOwnerFinancialData(): Observable<any> {
    return this.httpClient.get(`${environments.baseUrl}/owner/financials`)
  }
  OwnerPayment(data: object): Observable<any> {
    return this.httpClient.post(`${environments.baseUrl}/owner/payments`, data)
  }
}
