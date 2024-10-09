import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import * as d3 from 'd3';
import { DataService } from '../data.service';

interface BudgetItem {
  title: string;
  budget: number;
  backgroundColor: string;
}

@Component({
  selector: 'pb-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit {

  private svg!: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  private margin = 50;
  private width = 400;
  private height = 400;
  // The radius of the pie chart is half the smallest side
  private radius = Math.min(this.width, this.height) / 2 - this.margin;
  private colors!: d3.ScaleOrdinal<string, string>;
  public data: BudgetItem[] = [];

  public dataSource: ChartConfiguration['data'] = {
      datasets: [
          {
              data: [],
              backgroundColor: []
          }
      ],
      labels: []
  };

  public createSVG(): void {
    this.svg = d3.select("figure#myDoughnutChart")
    .append("svg")
    .attr("width", this.width)
    .attr("height", this.height)
    .append("g")
    .attr(
      "transform",
      "translate(" + this.width / 2 + "," + this.height / 2 + ")"
    );
  }

  private createColors(): void {
    this.colors = d3.scaleOrdinal<string>()
      .domain(this.data.map(d => d.budget.toString()))
      .range(["#c7d3ec", "#a5b8db", "#879cc4", "#677795", "#5a6782"]);
  }

  private drawChart(): void {
    const pie = d3.pie<BudgetItem>().value(d => d.budget);
  
    this.svg
      .selectAll('pieces')
      .data(pie(this.data))
      .enter()
      .append('path')
      .attr('d', (d: d3.PieArcDatum<BudgetItem>) => d3.arc<d3.PieArcDatum<BudgetItem>>()
        .innerRadius(100)
        .outerRadius(this.radius)(d))
      .attr('fill', (d, i) => this.colors(i.toString()))
      .attr("stroke", "#121926")
      .style("stroke-width", "0.5px");
  
    const labelLocation = d3.arc<d3.PieArcDatum<BudgetItem>>()
      .innerRadius(100)
      .outerRadius(this.radius);
  
    this.svg
      .selectAll('pieces')
      .data(pie(this.data))
      .enter()
      .append('text')
      .text(d => d.data.title)
      .attr("transform", d => `translate(${labelLocation.centroid(d)})`)
      .style("text-anchor", "middle")
      .style("font-size", 12)
      .style("fill", "black");
  }

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.getData().subscribe((budgetData: BudgetItem[]) => {
      this.dataService.myBudget = budgetData;
      this.updateDataSource(budgetData);
      this.createChart();
      this.data = budgetData;
      this.createD3Chart();
    });
  }
  

  private createD3Chart(): void {
    this.createSVG();
    this.createColors();
    this.drawChart();
  }
  private updateDataSource(budgetData: BudgetItem[]): void {
    this.dataSource.datasets[0].data = budgetData.map(item => item.budget);
    this.dataSource.labels = budgetData.map(item => item.title);
    this.dataSource.datasets[0].backgroundColor = budgetData.map(item => item.backgroundColor);
  }
  
  private createChart(): void {
    const canvas = document.getElementById("myChart") as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'pie',
          data: this.dataSource
        });
      } else {
        console.error('Failed to get drawing context');
      }
    } else {
      console.error('Cannot find canvas element');
    }
  }

}