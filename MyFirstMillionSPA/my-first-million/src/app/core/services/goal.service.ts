import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FinancialGoal, GoalProjection, InvestmentSuggestions } from '../models/goal.model';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private base = `${environment.apiUrl}/goals`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<FinancialGoal[]>(this.base);
  }

  getProjection(id: number) {
    return this.http.get<GoalProjection>(`${this.base}/${id}/projection`);
  }

  getInvestmentSuggestions() {
    return this.http.get<InvestmentSuggestions>(`${this.base}/suggestions`);
  }

  create(dto: Partial<FinancialGoal>) {
    return this.http.post<number>(this.base, dto);
  }

  update(id: number, dto: Partial<FinancialGoal>) {
    return this.http.put(`${this.base}/${id}`, dto);
  }

  addContribution(id: number, amount: number, date: string, notes?: string) {
    return this.http.post(`${this.base}/${id}/contributions`, { amount, date, notes });
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}
