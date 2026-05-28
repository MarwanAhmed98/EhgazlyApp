import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class CourtOwnerNavService {

  constructor(private readonly httpClient: HttpClient) { }
  GetNotifications(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/owner/notifications')
  }
  MarkAsRead(notificationId: number): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/owner/notifications/${notificationId}/read`, {})
  }
  MarkAllAsRead(): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/owner/notifications/read-all`, {})
  }
}
