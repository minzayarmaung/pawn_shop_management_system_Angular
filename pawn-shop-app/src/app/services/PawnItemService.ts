import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../shared/commons/api.config';

@Injectable({ providedIn: 'root' })
export class PawnItemService {
  private baseUrl = `${environment.apiBaseUrl}/auth/pawn-item`;

  constructor(private http: HttpClient) {}

  createPawnItem(payload: any): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }

  updatePawnItem(payload: any): Observable<any> {
    return this.http.post(this.baseUrl, payload);
  }
}
