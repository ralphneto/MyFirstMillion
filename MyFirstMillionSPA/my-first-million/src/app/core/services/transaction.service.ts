import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateTransactionRequest, Transaction, TransactionSummary } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private base = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  getAll(filters: { year?: number; month?: number; categoryId?: number; accountId?: number; type?: string; page?: number }) {
    let params = new HttpParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params = params.set(k, v);
    });
    return this.http.get<{ total: number; page: number; pageSize: number; items: Transaction[] }>(this.base, { params });
  }

  getSummary(year: number, month: number) {
    return this.http.get<TransactionSummary>(`${this.base}/summary`, {
      params: new HttpParams().set('year', year).set('month', month)
    });
  }

  create(dto: CreateTransactionRequest) {
    return this.http.post<number>(this.base, dto);
  }

  update(id: number, dto: Partial<CreateTransactionRequest>) {
    return this.http.put(`${this.base}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
