import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable()
export class ApiService {
  url_original: string;
  url_vanity: string;
  url_stat: string;
  constructor(
    private http: HttpClient) 
    { }

// Gets the Short URL generated from the server
UrlShort(): Observable<any> {
    if (this.url_original === undefined || this.url_original === null) { this.url_original = ''; }
    const url = 'http://localhost:3000/urlShort/add?url=' + this.url_original+ '&vanity=' + this.url_vanity;
    return this.http.get(url);
}

// Gets the custom URL statistics data from the Server
urlStats():Observable<any> {
    if (this.url_stat === undefined || this.url_stat === null) { this.url_stat = ''; }
    const url = 'http://localhost:3000/urlShort/stats?url=' + this.url_stat;
    return this.http.get(url);
}

}

