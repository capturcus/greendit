import { Injectable } from '@angular/core';
import * as co2 from 'client-oauth2';
import * as uuidv4 from 'uuid/v4';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GoogleService } from './google.service';
import { Observable } from 'rxjs';

import {TEST_DATA} from '../testdata';

// http://localhost:4200/callback?state=12c0ef1f-1c86-4321-8ee0-249585ff5ae9&code=REZUZJ52vHaPyKnmZZa0--4NcMI

const REDIRECT_URI = "http://localhost:4200/callback";
const BASIC_AUTH = "Basic Wl9BZzNybS1FVWoxX3c6Zm9LVHU0Y3VoV2RKV2dKSXhLN3hON0pBUWlV";

@Injectable({
  providedIn: 'root'
})
export class RedditService {

  public getHttpOptions() {
    let token = localStorage.getItem("reddit_access_token");
    return {
      headers: new HttpHeaders({
        Authorization: "bearer " + token
      })
    }
  }

  public getPosts(): Observable<any> {
    // return this.http.get("https://oauth.reddit.com/hot", this.getHttpOptions());
    return Observable.create((ob) => {
      ob.next(TEST_DATA);
    })
  }

  constructor(
    private http: HttpClient,
    private google: GoogleService
  ) { }

  private getJsonFromUrl() {
    var query = location.search.substr(1);
    var result = {};
    query.split("&").forEach(function (part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
  }

  init() {
    if (window.location.href.includes("/callback?")) {
      let postLink = "https://www.reddit.com/api/v1/access_token";

      let urlValues = this.getJsonFromUrl();

      var xhr = new XMLHttpRequest();
      let that = this;
      xhr.onreadystatechange = function () {
        var DONE = 4; // readyState 4 means the request is done.
        var OK = 200; // status 200 is a successful return.
        if (xhr.readyState === DONE) {
          if (xhr.status === OK) {
            let data = JSON.parse(xhr.responseText);
            that.handleData(data);
            window.history.pushState("", "Greendit", "http://localhost:4200");
          }
        }
      }
      xhr.open('POST', postLink);
      xhr.setRequestHeader('Authorization', BASIC_AUTH);
      xhr.setRequestHeader('Content-type', "application/x-www-form-urlencoded");
      xhr.send("grant_type=authorization_code&code=" + urlValues["code"] + "&redirect_uri=" + REDIRECT_URI);
      return;
    }
  }

  private handleData(data) {
    if (data.access_token !== undefined && data.refresh_token !== undefined) {
      localStorage.setItem("reddit_access_token", data.access_token);
      localStorage.setItem("reddit_refresh_token", data.refresh_token);
    }
    this.google.signInIfNecessary();
  }

  public login(): boolean {
    if (localStorage.getItem("reddit_access_token") !== null) {
      return true;
    }
    let redditCo2 = new co2({
      clientId: 'Z_Ag3rm-EUj1_w',
      clientSecret: 'foKTu4cuhWdJWgJIxK7xN7JAQiU',
      accessTokenUri: 'https://www.reddit.com/api/v1/access_token',
      authorizationUri: 'https://www.reddit.com/api/v1/authorize',
      redirectUri: REDIRECT_URI,
      scopes: ['identity', 'read']
    });
    let state = uuidv4();
    let redirectLink = redditCo2.code.getUri() + state;
    redirectLink += "&duration=permanent";
    console.log(redirectLink);
    window.location.href = redirectLink;
    return false;
  }
}
