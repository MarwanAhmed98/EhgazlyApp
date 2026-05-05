import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class PlayerProfileService {

  constructor(private readonly httpClient: HttpClient) { }
  GetProfile(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/customer/profile')
  }
}
