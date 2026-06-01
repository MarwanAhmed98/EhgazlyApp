import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environments } from '../../../shared/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminTournamentsService {

  constructor(private readonly httpClient: HttpClient) { }
  CreateTournament(data: any): Observable<any> {
    return this.httpClient.post(environments.baseUrl + '/admin/tournaments', data);
  }
  ShowTournaments(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/admin/tournaments');
  }
  ShowSpecificCourt(TournamentId: string | number): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/admin/tournaments/${TournamentId}`);
  }
  UpdateTournament(TournamentId: string | number, data: any): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/tournaments/${TournamentId}`, data);
  }
  DeleteTournament(TournamentId: string | number): Observable<any> {
    return this.httpClient.delete(environments.baseUrl + `/admin/tournaments/${TournamentId}`);
  }
  UpdateTournamentStatus(TournamentId: string | number, status: string): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/tournaments/${TournamentId}/status`,
      {
        "status": status
      }
    );
  }
  CheckSlots(CourtId: string | number, selectedDate: string): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/admin/courts/${CourtId}/timeslots?date=${selectedDate}`);
  }
  GetTeams(TournamentId: string | number): Observable<any> {
    return this.httpClient.get(environments.baseUrl + `/admin/tournaments/${TournamentId}/teams`);
  }
  ApproveTeam(TournamentId: string | number, TeamId: string | number): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/tournaments/${TournamentId}/teams/${TeamId}/confirm`, {});
  }
  RejectTeam(TournamentId: string | number, TeamId: string | number, rejection_reason: string): Observable<any> {
    return this.httpClient.put(environments.baseUrl + `/admin/tournaments/${TournamentId}/teams/${TeamId}/reject`,
      {
        "rejection_reason": rejection_reason
      }
    );
  }

}
