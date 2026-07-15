import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Account } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private base = `${environment.apiUrl}/accounts`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Account[]>(this.base);
  }

  getById(id: number) {
    return this.http.get<Account>(`${this.base}/${id}`);
  }

  create(dto: Partial<Account>) {
    return this.http.post<number>(this.base, dto);
  }

  update(id: number, dto: Partial<Account>) {
    return this.http.put(`${this.base}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
