import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, of, observable } from 'rxjs';
import { catchError, switchMap } from "rxjs/internal/operators";
import { RedditService } from './reddit.service';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  constructor(
    private reddit: RedditService
  ) {
  }

  private renewAccessToken(): Observable<any> {
    return Observable.create((observer) => {
      let postLink = "https://www.reddit.com/api/v1/access_token";
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        var DONE = 4; // readyState 4 means the request is done.
        var OK = 200; // status 200 is a successful return.
        if (xhr.readyState === DONE) {
          if (xhr.status === OK) {
            let data = JSON.parse(xhr.responseText);
            observer.next(data);
          }
        }
      }
      xhr.open('POST', postLink);
      xhr.setRequestHeader('Authorization', this.reddit.getBasicAuth());
      xhr.setRequestHeader('Content-type', "application/x-www-form-urlencoded");
      xhr.send("grant_type=refresh_token&refresh_token=" + localStorage.getItem("reddit_refresh_token"));
    })
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error, caught) => {
        //intercept the respons error and displace it to the console
        console.log(error);
        if (error.status === 401) {
          if (error.url.includes("https://oauth.reddit.com")) {
            console.log("handling error");
            return this.renewAccessToken()
              .pipe(
                switchMap((data) => {
                  console.log("INNER DATA", data);
                  localStorage.setItem("reddit_access_token", data.access_token);
                  let newRequest = request.clone({
                    setHeaders: {
                      Authorization: "bearer " + data.access_token
                    }
                  })
                  return next.handle(newRequest)
                })
              )
          }
        }
        return of(error);
      }) as any);
  }

  private handleError(err: HttpErrorResponse): Observable<any> {
    if (err.status === 401) {
      if (err.url.includes("https://oauth.reddit.com")) {

        // a reddit api call failed, refresh.

      }
      return of(err.message);
    }
    throw err;
  }
}