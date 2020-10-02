import { Component, ViewChild ,OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { NgModel } from '@angular/forms';
import { ChartOptions, ChartType, ChartDataSets, ChartUpdateProps } from 'chart.js';
import { Label, Color,BaseChartDirective, ThemeService } from 'ng2-charts';


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss']
})
export class StatisticsComponent implements OnInit,OnDestroy {
 
  @ViewChild(BaseChartDirective)
  public chart: BaseChartDirective;

// Variable to store the custom URL
urlShort:string;

urlViewsSub:Subscription;

// Variable to store the custom URL statistics
urlStat:Array<{
  stat_id:'',
  viewer_ip:'',
  view_day:number,
  view_month:number,
  view_year:number,
}>=new Array();

urlView = {
  hash:'',
  clicks:'',
  result:'',
  urlStatObj:this.urlStat
};

// Dummy variable to store clicks per month
dummy_click_per_month = [0,0,0,0,0,0,0,0,0,0,0,0];

// Variable stores the clicks per month
click_per_month:number[] = new Array(12);

  constructor(
    private router: Router,
    private ApiService: ApiService
  ) { }

  ngOnInit(): void { 
  }
  
  ngOnDestroy() {
    this.urlViewsSub.unsubscribe();
  }

  /**
   * Subscribe to the statistics API
   * Calls the Success() function if no error
   * Or Calls the Error() function if error occurs
   */
showStatistics(){
    this.urlViewsSub = this.ApiService.urlStats().subscribe(
      res => this.Success(res),
      err => this.Error(err)
    )
}

  /**
   * Description: On success, assigns the urlView variable with custom URL, clicks/month, result of search query, get date of view
   * @param res : response
   */

Success(res) {
    this.urlView = res;
    // If Custom URL is present in Database
    if(res.result){
      // Hash: custom URL which is attached to root url
      this.urlView.hash ='localhost:3000/urlShort/' + res.hash;
      
      if(res.clicks===null)
       this.urlView.clicks = '0';
      else
       this.urlView.clicks = res.clicks;

      this.urlView.result = "Custom URL is present in database";
    
      // If Num of Views > 0 then assign the Viewer IP, View Date, Month, Year
      // Update the Click/months
      for(let i=0;i<res.viewers.length;i++){
        const _date = new Date(res.viewers[i].view_date);
        this.urlStat.push({stat_id: res.viewers[i].stat_id,
                          viewer_ip: res.viewers[i].viewer_ip,
                          view_day: _date.getDate(),
                          view_month: _date.getMonth(),
                          view_year: _date.getFullYear()});
        
        if(this.dummy_click_per_month[_date.getMonth()-1]===undefined || this.dummy_click_per_month[_date.getMonth()]===NaN)
          this.dummy_click_per_month[_date.getMonth()-1] = 1;
        else
          this.dummy_click_per_month[_date.getMonth()-1]+=1;
      }

      this.urlView.urlStatObj=this.urlStat;
      this.urlStat=[];

      for(let i=0;i<12;i++){
        if(this.dummy_click_per_month[i]===undefined || this.dummy_click_per_month[i]===NaN)
           this.dummy_click_per_month[i]=0;
      }

      this.click_per_month = this.dummy_click_per_month;
    }
    else{
      // Custom URL is not present in the database
      // Else reset all the variables
      this.urlView.clicks = '0';
      this.urlView.hash = '';
      this.urlView.result = "Custom URL entered is wrong. Please check again."
      this.urlView.urlStatObj = this.urlStat;
      this.click_per_month=[];
    }
  }

/**
 * Description: Error function to display the error
 * @param err : error 
 */
  Error(err){
    console.log(err);
  }
  
  /**
   * Description: On submitting the form to get statistics of custom URL,
   *  get the data from backend API and show the statistics 
   */
  onSubmit() {
    this.ApiService.url_stat = this.urlShort;
    this.showStatistics();
  }
  
// Title of the bar graph
title = 'Views per Month';
  
// Updating the bar chart
ngAfterViewInit(){
  if (this.chart) {
          this.chart.update();
  }
}

// To display the Bar Chart responsively
public barChartOptions: ChartOptions = {
    responsive: true,
};

// Labels for X-Axis
public barChartLabels: Label[] = ["January", "Feburary", "March", "April", "May","June","July","August","September","October","November","December"];
// Chart Type
public barChartType: ChartType = 'bar';
// Setting the legend
public barChartLegend = true;

public barChartPlugins:any = {'backgroundColor': ["#FF6384","#4BC0C0","#FFCE56","#E7E9ED","#36A2EB"]}

// Background color of the bars
public barChartColors: Color[] = [
  { backgroundColor: 'green' },
  ]

// Setting the bar chart data
public barChartData: ChartDataSets[] = [
    //@ts-ignore
    { data: this.click_per_month, label: 'Url Views per Month' }
  ];

}

