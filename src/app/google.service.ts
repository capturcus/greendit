import { Injectable } from '@angular/core';
import {
  GoogleApiModule,
  GoogleApiService,
  GoogleAuthService,
  NgGapiClientConfig,
  NG_GAPI_CONFIG,
  GoogleApiConfig
} from "ng-gapi";

import GoogleUser = gapi.auth2.GoogleUser;
import GoogleAuth = gapi.auth2.GoogleAuth;
import { HttpClient, HttpHeaders } from '@angular/common/http';

// import { GoogleUser } from 'gapi.auth2';

@Injectable({
  providedIn: 'root'
})
export class GoogleService {

  private user: GoogleUser;
  public static SESSION_STORAGE_KEY: string = 'accessToken';

  constructor(
    private googleAuth: GoogleAuthService,
    private gapiService: GoogleApiService,
    private http: HttpClient
  ) {
    this.gapiService.onLoad().subscribe((x) => {
      console.log("gapi", x);
      console.log("google sign in");
      this.googleAuth.getAuth()
        .subscribe((auth) => {
          console.log("auth callback", auth.isSignedIn.get(), auth.currentUser.get());
          console.log(auth.signIn());
          auth.signIn().then(a => console.log("sign in ok", a), b => console.log("sign in err", b));
        });
    });
  }

  public getToken(): string {
    let token: string = localStorage.getItem("google_access_token");
    if (!token) {
      this.signIn();
    }
    return token;
  }

  public signInIfNecessary() {
    if (localStorage.getItem("google_access_token") === null) {
      this.signIn();
    }
  }

  public signIn(): void {

  }

  private signInSuccessHandler(res) {
    this.user = res;
    console.log("USER", this.user);
    localStorage.setItem("google_access_token", res.getAuthResponse().access_token);
    localStorage.setItem("google_refresh_token", res.getAuthResponse().refresh_token);
    console.log("google all set!");
  }

  public googleDrive() {
    this.http.get("https://www.googleapis.com/drive/v3/files", {
      headers: new HttpHeaders({
        Authorization: "Bearer " + this.getToken()
      })
    }).subscribe((data) => {
      console.log(data);
    })
  }
}
