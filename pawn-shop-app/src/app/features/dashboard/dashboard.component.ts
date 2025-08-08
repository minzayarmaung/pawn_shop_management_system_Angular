import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

interface ChartDataPoint {
  label: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  totalAmount = 125000;
  totalItems = 320;
  totalUsers = 58;
  totalProfits = 23000;

  chartData: ChartDataPoint[] = [
    { label: 'Jan', value: 3000 },
    { label: 'Feb', value: 4000 },
    { label: 'Mar', value: 3500 },
    { label: 'Apr', value: 5000 },
    { label: 'May', value: 4500 },
    { label: 'Jun', value: 6000 }
  ];

  maxValue: number = 0;
  gridLines: number[] = [];
  yAxisLabels: number[] = [];

  ngOnInit(): void {
    this.setupChart();
  }

  private setupChart(): void {
    // Find the maximum value for scaling
    this.maxValue = Math.max(...this.chartData.map(d => d.value));
    
    // Add some padding to the top
    this.maxValue = Math.ceil(this.maxValue * 1.2);
    
    // Create grid lines (5 horizontal lines)
    this.gridLines = [0, 25, 50, 75, 100];
    
    // Create Y-axis labels
    const step = this.maxValue / 4;
    this.yAxisLabels = [
      this.maxValue,
      Math.round(this.maxValue * 0.75),
      Math.round(this.maxValue * 0.5),
      Math.round(this.maxValue * 0.25),
      0
    ];
  }
}