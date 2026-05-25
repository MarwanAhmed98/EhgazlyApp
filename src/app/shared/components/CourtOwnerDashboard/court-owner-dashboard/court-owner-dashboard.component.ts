import { OnwerDashboardService } from './../../../../core/services/OwnerDashboard/onwer-dashboard.service';
import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
interface ChartBar {
  label: string;
  totalHeight: number;
  revenueRatio: number;
  value: string;
}
@Component({
  selector: 'app-court-owner-dashboard',
  imports: [CommonModule],
  templateUrl: './court-owner-dashboard.component.html',
  styleUrl: './court-owner-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush

})
export class CourtOwnerDashboardComponent implements OnInit {
  private readonly OnwerDashboardService = inject(OnwerDashboardService);
  ngOnInit(): void {
    this.GetOwnerDashboard();
  }
  GetOwnerDashboard(): void {
    this.OnwerDashboardService.GetOwnerDashboard().subscribe({
      next: (res) => {
        console.log(res);

      }
    })
  }

}
