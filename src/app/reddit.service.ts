import {Injectable} from '@angular/core';
import * as co2 from 'client-oauth2';
import * as uuidv4 from 'uuid/v4';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {GoogleService} from './google.service';
import {Observable, Observer} from 'rxjs';

import {TEST_DATA} from '../testdata';
import { TEST_COMMENTS } from 'src/testcomments';

// http://localhost:4200/callback?state=12c0ef1f-1c86-4321-8ee0-249585ff5ae9&cod
// e=REZUZJ52vHaPyKnmZZa0--4NcMI

const REDIRECT_URI = "http://localhost:4200/callback";
const BASIC_AUTH = "Basic Wl9BZzNybS1FVWoxX3c6Zm9LVHU0Y3VoV2RKV2dKSXhLN3hON0pBUWlV";

const SERVE_TEST_DATA = true;

@Injectable({providedIn: 'root'})
export class RedditService {

  after : string;
  observer : Observer < any >;

  public getBasicAuth() {
    return BASIC_AUTH;
  }

  public getHttpOptions() {
    let token = localStorage.getItem("reddit_access_token");
    return {
      headers: new HttpHeaders({
        Authorization: "bearer " + token
      }),
      observe: 'response' as 'response'
    }
  }

  public getComments(postID) {
    if(SERVE_TEST_DATA) {
      return Observable.create((ob) => {
        ob.next(TEST_COMMENTS);
      });
    }

    let link = "https://oauth.reddit.com/comments/"+postID+"?sort=top"; //&depth=3
    return this.http.get(link, this.getHttpOptions());
  }

  public getPosts() : Observable < any > {

    if(SERVE_TEST_DATA) {
      return Observable.create((ob) => {
        ob.next(TEST_DATA);
      });
    }

    if (localStorage.getItem("reddit_access_token") === null) {
      console.log("reddit access token is null");
      return Observable.create((ob) => {
        console.log("observer registered");
        this.observer = ob;
      });
    }

    return Observable.create((observer) => {
      let link = "https://oauth.reddit.com/hot";
      if (this.after !== undefined) {
        link += "?after=" + this.after;
      }
      this.http.get(link, this.getHttpOptions()).subscribe((data) => {
          console.log("DATA", data);
          this.after = data.body['data'].after;
          observer.next(data.body);
        })
    });

    /*return Observable.create((ob) => {
      ob.next({data: []});
    });*/
  }

  constructor(private http : HttpClient, private google : GoogleService,) {}

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
            window
              .history
              .pushState("", "Greendit", "http://localhost:4200");
          }
        }
      }
      xhr.open('POST', postLink);
      xhr.setRequestHeader('Authorization', BASIC_AUTH);
      xhr.setRequestHeader('Content-type', "application/x-www-form-urlencoded");
      xhr.send("grant_type=authorization_code&code=" + urlValues["code"] + "&redirect_uri=" + REDIRECT_URI);
      return;
    } else {
      this.login();
    }
  }

  private handleData(data) {
    if (data.access_token !== undefined && data.refresh_token !== undefined) {
      localStorage.setItem("reddit_access_token", data.access_token);
      localStorage.setItem("reddit_refresh_token", data.refresh_token);
      if (this.observer !== undefined) {
        let link = "https://oauth.reddit.com/hot";
        if (this.after !== undefined) {
          link += "?after=" + this.after;
        }
        this.http.get(link, this.getHttpOptions()).subscribe((data) => {
            console.log("DATA", data);
            this.after = data.body['data'].after;
            console.log(this.after);
            this.observer.next(data.body);
            this.observer = undefined;
          })
      }
    }
    this
      .google
      .signInIfNecessary();
  }

  public login() : boolean {
    if(localStorage.getItem("reddit_access_token") !== null || SERVE_TEST_DATA) {
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
    let redirectLink = redditCo2
      .code
      .getUri() + state;
    redirectLink += "&duration=permanent";
    console.log(redirectLink);
    window.location.href = redirectLink;
    return false;
  }
}
