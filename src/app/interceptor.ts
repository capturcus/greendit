import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from "rxjs/internal/operators";
import { RedditService } from './reddit.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  constructor(
    private reddit: RedditService
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request).pipe(
      catchError((error, caught) => {
        //intercept the respons error and displace it to the console
        console.log(error);
        this.handleError(error);
        return of(error);
      }) as any);
  }

  private handleError(err: HttpErrorResponse): Observable<any> {
    if (err.status === 401) {
      if (err.url.includes("https://oauth.reddit.com")) {

        // a reddit api call failed, refresh.
        let postLink = "https://www.reddit.com/api/v1/access_token";
        var xhr = new XMLHttpRequest();
        let that = this;
        xhr.onreadystatechange = function () {
          var DONE = 4; // readyState 4 means the request is done.
          var OK = 200; // status 200 is a successful return.
          if (xhr.readyState === DONE) {
            if (xhr.status === OK) {
              let data = JSON.parse(xhr.responseText);
              console.log("DATA", data);
              localStorage.setItem("reddit_access_token", data.access_token);
              // window.history.pushState("", "Greendit", "http://localhost:4200");
            }
          }
        }
        xhr.open('POST', postLink);
        xhr.setRequestHeader('Authorization', this.reddit.getBasicAuth());
        xhr.setRequestHeader('Content-type', "application/x-www-form-urlencoded");
        xhr.send("grant_type=refresh_token&refresh_token="+localStorage.getItem("reddit_refresh_token"));
      }
      return of(err.message);
    }
    throw err;
  }
}