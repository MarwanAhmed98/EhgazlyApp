import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class CourtOwnerPaymentMethodService {

  constructor(private readonly httpClient: HttpClient) { }
  AddPaymentMethod(maincourtId: any, data: any): Observable<any> {
    return this.httpClient.post(environments.baseUrl + `/owner/maincourts/${maincourtId}/payment-methods`, data);
  }
  ShowPaymentMethod(maincourtId: any): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/owner/maincourts/${maincourtId}/payment-methods`);
  }
  EditPaymentMethod(paymentId: any, data: any): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/owner/payment-methods/${paymentId}`, data);
  }
  DeletePaymentMethod(paymentId: any): Observable<any> {
    return this.httpClient.delete(environments.baseUrl + `/owner/payment-methods/${paymentId}`);
  }

}
