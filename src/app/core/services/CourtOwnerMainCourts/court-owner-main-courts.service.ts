import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class CourtOwnerMainCourtsService {

  constructor(private readonly httpClient: HttpClient) { }
  AddMainCourt(data: any): Observable<any> {
    return this.httpClient.post(environments.baseUrl + '/owner/maincourts', data);
  }
  GetMainCourt(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/owner/maincourts');
  }
  GetSpecificCourt(courtId: string): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/owner/maincourts/${courtId}`);
  }
  EditMainCourt(courtId: string, data: any): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/owner/maincourts/${courtId}`, data);
  }
  DeleteMainCourt(courtId: string): Observable<any> {
    return this.httpClient.delete(environments.baseUrl + `/owner/maincourts/${courtId}`);
  }
  AddMainCourtImage(courtId: string, data: any): Observable<any> {
    return this.httpClient.post(environments.baseUrl + `/owner/maincourts/${courtId}/images`, data);
  }
  DeleteMainCourtImage(imageId: string): Observable<any> {
    return this.httpClient.delete(environments.baseUrl + `/owner/images/${imageId}`);
  }
  AddMainCourtAmenities(courtId: string, AmenitiesIds: number[]): Observable<any> {
    return this.httpClient.post(environments.baseUrl + `/owner/maincourts/${courtId}/amenities`,
      {
        "amenity_ids": AmenitiesIds
      }
    );
  }
  GetMainCourtAmenities(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/owner/amenities');
  }


}
