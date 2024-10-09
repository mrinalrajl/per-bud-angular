import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface BudgetItem {
  title: string;
  budget: number;
  backgroundColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public myBudget: BudgetItem[] = [];

  constructor(private http: HttpClient) {}

  public getData(): Observable<BudgetItem[]> {
    return this.http.get<BudgetItem[]>('http://localhost:3000/budget');
  }
}