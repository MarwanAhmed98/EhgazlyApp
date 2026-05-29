import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminManageOwnersService {

  constructor(private readonly httpClient: HttpClient) { }
  ApproveOwner(OwnerId: string | number): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/owners/${OwnerId}/approve`, {});
  }
  ShowAllOwners(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/admin/owners');
  }
  ShowSpecificOwner(OwnerId: string): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/admin/owners/${OwnerId}`);
  }
  RejectOwner(OwnerId: string | number): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/owners/${OwnerId}/reject`, {});
  }
  SuspendOwner(OwnerId: string | number): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/owners/${OwnerId}/suspend`, {});
  }
  ActivateOwner(OwnerId: string | number): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/owners/${OwnerId}/activate`, {});
  }
}
