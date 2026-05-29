import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class TournamentsService {

  constructor(private readonly httpClient: HttpClient) { }
  GetAllTournaments(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/customer/tournaments/all')
  }
}
