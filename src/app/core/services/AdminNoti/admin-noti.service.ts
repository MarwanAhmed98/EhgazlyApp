import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminNotiService {

  constructor(private readonly httpClient: HttpClient) { }
  GetNotifications(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/admin/notifications')
  }
  MarkAsRead(notificationId: number): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/notifications/${notificationId}/read`, {})
  }
  MarkAllAsRead(): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/notifications/read-all`, {})
  }
}
