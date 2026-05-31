import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class CourtOwnerManageScheduleService {

  constructor(private readonly httpClient: HttpClient) { }
  GetSlots(CourtId: string | number, selectedDate: string): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/owner/courts/${CourtId}/timeslots?date=${selectedDate}`);
  }
  BlockSlot(SlotId: string | number): Observable<any> {
    return this.httpClient.post(environments.baseUrl + `/owner/timeslots/${SlotId}/block`, {});
  }
  UnblockSlot(SlotId: string | number): Observable<any> {
    return this.httpClient.post(environments.baseUrl + `/owner/timeslots/${SlotId}/unblock`, {});
  }
  BlockBult(timeslotIds: number[]): Observable<any> {
    return this.httpClient.post(environments.baseUrl + `/owner/timeslots/block-bulk`,
      {
        "timeslot_ids": timeslotIds
      }
    );
  }
  UnblockBult(timeslotIds: number[]): Observable<any> {
    return this.httpClient.post(environments.baseUrl + `/owner/timeslots/unblock-bulk`,
      {
        "timeslot_ids": timeslotIds
      }
    );
  }
}
