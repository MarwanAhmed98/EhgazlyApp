import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, catchError, throwError } from 'rxjs';

export interface GeocodeResult {
  lat: number;
  lon: number;
  display_name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) { }

  getCoordinates(address: string): Observable<GeocodeResult> {
    const params = new HttpParams()
      .set('q', address)
      .set('format', 'json')
      .set('limit', '1')
      .set('addressdetails', '0');

    // Nominatim requires a valid User-Agent header
    const headers = {
      'User-Agent': 'YourAppName/1.0 (your.email@example.com)'
    };

    return this.http.get<any[]>(this.NOMINATIM_URL, { params, headers }).pipe(
      map(response => {
        if (!response || response.length === 0) {
          throw new Error('No coordinates found for the given address');
        }
        const first = response[0];
        return {
          lat: parseFloat(first.lat),
          lon: parseFloat(first.lon),
          display_name: first.display_name
        };
      }),
      catchError(err => {
        console.error('Geocoding API error:', err);
        return throwError(() => new Error('Geocoding failed. Please check the address or try again later.'));
      })
    );
  }
}