import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class PlayerNotiService {

  constructor(private readonly httpClient: HttpClient) { }
  GetNotifications(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/customer/notifications')
  }
  MarkAsRead(notificationId: number): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/customer/notifications/${notificationId}/read`, {})
  }
  MarkAllAsRead(): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/customer/notifications/read-all`, {})
  }

}
