import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../shared/commons/api.config';
import { PawnItem } from '../models/pawn-item.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class PawnItemService {

  private baseUrl = `${environment.apiBaseUrl}/auth/pawn-item`;

  constructor(private http: HttpClient) {}

  createPawnItem(payload: any): Observable<any> {
    return this.http.post(this.baseUrl , payload);
  }

  updatePawnItem(payload: any): Observable<any> {
    return this.http.post(this.baseUrl + '/update-pawn-item', payload);
  }

  getPawnItems(category: string, sortBy: string): Observable<ApiResponse<PawnItem[]>> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (sortBy) params = params.set('sortBy', sortBy);
    return this.http.get<ApiResponse<PawnItem[]>>(this.baseUrl + '/all-pawn-items', { params });
  }

  deletePawnItem(id: string): Observable<ApiResponse<any>> {
    console.log(id);
  return this.http.post<ApiResponse<any>>(
    this.baseUrl + '/delete-pawn-item',
    null,
    { params: new HttpParams().set('id', id.toString()) }
  );
}

}
