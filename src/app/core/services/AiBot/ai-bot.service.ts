import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environments } from '../../../shared/environment';

@Injectable({
  providedIn: 'root'
})
export class AiBotService {

  constructor(private readonly httpClient: HttpClient) { }
  GetAiQuestions(): Observable<any> {
    return this.httpClient.get(environments.baseUrl + '/customer/chatbot/suggested-questions');
  }
  AskAi(message: string): Observable<any> {
    return this.httpClient.post(environments.baseUrl + `/customer/chatbot`,
      {
        "message": message
      }
    );
  }

}
