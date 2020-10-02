import { Component, OnInit, EventEmitter,Input,Output, ViewChild } from '@angular/core';
import { ApiService } from '../api/api.service';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})


export class HomeComponent implements OnInit {

@ViewChild(NgForm) ngForm: NgForm;
@Input('url_original') url_original; // Original URL
@Input('url_vanity') url_vanity; // Custom URL
@Output() submitForm = new EventEmitter();

constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

ngOnInit(): void {
  }

/**
 * On submitting the form assign URL original & custom URL name & redirect to shortUrl component to insert in the database
 * If vanity is Custom URL name is not provided then a unique short URL is generated  
 * If vanity provided is already have been assigned to a different URL than a unique short URL is generated
 */
onSubmit() {

  this.apiService.url_original = this.url_original;
  this.apiService.url_vanity = this.url_vanity;
  this.router.navigate(['/shortUrl']);
}

}
