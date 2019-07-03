import { Injectable } from '@angular/core';
import {
  GoogleAuthService,
  GoogleApiService
} from "ng-gapi";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Observer } from 'rxjs';
import uuid from 'uuid';

declare var gapi;
/*
 this.http.get("https://www.googleapis.com/drive/v3/files", {
   headers: new HttpHeaders({
     Authorization: "Bearer " + this.getToken()
   })
 }).subscribe((data) => {
   console.log(data);
 })
*/
/*
  client_id: "695981349564-qjtc4r23ea566q9mligl4porm3i1c17h.apps.googleusercontent.com",
  discoveryDocs: ["https://analyticsreporting.googleapis.com/$discovery/rest?version=v4"],
  scope: [
    "https://www.googleapis.com/auth/drive",
  ].join(" ")
   */

const GREENDIT_HISTORY_FILENAME = "greendit_history.json";

@Injectable({ providedIn: 'root' })
export class GoogleService {
  public static SESSION_STORAGE_KEY: string = 'accessToken';
  private user;

  constructor(private googleAuth: GoogleAuthService,
    private gapiService: GoogleApiService,
    private http: HttpClient) {
    gapiService.onLoad().subscribe(() => {
      console.log("gapi loaded");
      gapi.load('client', {
        callback: function () {
          // Handle gapi.client initialization.
          console.log("GAPI LOADED", gapi);
        }
      })
    })
  }

  public getToken(): string {
    let token: string = sessionStorage.getItem(GoogleService.SESSION_STORAGE_KEY);
    if (!token) {
      throw new Error("no token set , authentication required");
    }
    return sessionStorage.getItem(GoogleService.SESSION_STORAGE_KEY);
  }

  public signIn(): void {
    console.log("starting google sign in");
    this.googleAuth.getAuth()
      .subscribe((auth) => {
        auth.signIn().then(res => this.signInSuccessHandler(res));
      });
  }

  putHistoryFile(data, fileIsNew) {
    const boundary = uuid.v4();
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const contentType = 'application/json';

    let metadata = {
      'name': GREENDIT_HISTORY_FILENAME,
      'mimeType': contentType
    };

    let multipartRequestBody =
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: ' + contentType + '\r\n\r\n' +
      JSON.stringify(data) +
      close_delim;

    console.log("GAPI", gapi);
    let request = gapi.client.request({
      'path': '/upload/drive/v3/files',
      'method': fileIsNew ? 'POST' : 'PUT',
      'params': { 'uploadType': 'multipart' },
      'headers': {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody
    });
    let callback = function (file) {
      console.log("UPLOADED", file);
    };
    request.execute(callback);
  }

  getHistoryId() {
    return new Observable((observer) => {
      this.http.get("https://www.googleapis.com/drive/v3/files", {
        headers: new HttpHeaders({
          Authorization: "Bearer " + this.getToken()
        })
      }).subscribe((data: any) => {
        console.log("DATA", data);
        for (let f of data.files) {
          if (f.name === GREENDIT_HISTORY_FILENAME) {
            observer.next(f.id);
            return;
          }
        }

        console.log("greendit history not found");
        this.putHistoryFile({ "a": "b" }, true);
      })
    });
  }

  private signInSuccessHandler(res) {
    this.user = res;
    sessionStorage.setItem(
      GoogleService.SESSION_STORAGE_KEY, res.getAuthResponse().access_token
    );

    console.log("LOGGED IN USER", this.user, this.getToken());

    this.getHistoryId().subscribe((id) => { console.log("RETRIEVED HISTORY ID", id) })
  }
}