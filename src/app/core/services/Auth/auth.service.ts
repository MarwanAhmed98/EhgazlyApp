import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor( private httpClient: HttpClient ) { }
   sendLoginForm(data: object): Observable<any> {
    return this.httpClient.post(`${environments.baseUrl}/login`, data)
  }
  
}
