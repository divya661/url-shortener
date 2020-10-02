import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../api/api.service';
import { HomeComponent } from './home.component';
import { render } from '@testing-library/angular';
import { ComponentFixtureAutoDetect } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { element } from 'protractor';
import { By } from '@angular/platform-browser';

describe('HomeComponent', () => {
  component: HomeComponent;
    var fixture: ComponentFixture<HomeComponent>;
    var comp = fixture.componentInstance;
    // let de = fixture.debugElement.query(By.css('url'));
    // let el = de.nativeElement;
    let router = {
      navigate: jasmine.createSpy('navigate')
    }
    let MockApiService = {
      original : 'https://google.com',
      vanity : 'google'
    }

  beforeEach(async () => {
   
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ HomeComponent ],
      providers:[
        {
          provide:ApiService, useValue:MockApiService
        },
        { provide: Router,useValue: router }
      ]
    })
    .compileComponents().then(() =>{
         fixture = TestBed.createComponent(HomeComponent);
         comp = fixture.componentInstance;
  
  });

    
  it(`should have original url`,() => {
    expect(comp.url_original).toBeDefined();
  });
  it(`should navigate to urlShort on submit`,() => {
    comp.onSubmit();
    expect(MockApiService.original.toString());
    expect(MockApiService.vanity.toString());
    expect(router.navigate).toHaveBeenCalledWith(['/shortUrl']);
  });

 
  beforeEach(() => {
    let fixture = TestBed.createComponent(HomeComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();
    
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  });

});
});