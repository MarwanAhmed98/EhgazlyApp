import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class PlayerFRiendlyMatchService {

  constructor(private readonly httpClient: HttpClient) { }
  GetAllMatches(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/customer/matches')
  }
  GetSpecificMatches(id: string): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/customer/matches/${id}`)
  }
}
