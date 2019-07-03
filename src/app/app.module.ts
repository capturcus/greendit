import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SideListComponent } from './side-list/side-list.component';
import { SiteHeaderComponent } from './site-header/site-header.component';
import { MainViewComponent } from './main-view/main-view.component';

import { RequestInterceptor } from './interceptor';
import { CommentComponent } from './comment/comment.component';

import {
  GoogleApiModule, 
  GoogleApiService, 
  GoogleAuthService, 
  NgGapiClientConfig, 
  NG_GAPI_CONFIG,
  GoogleApiConfig
} from "ng-gapi";

let gapiClientConfig: NgGapiClientConfig = {
  client_id: "695981349564-qjtc4r23ea566q9mligl4porm3i1c17h.apps.googleusercontent.com",
  discoveryDocs: ["https://analyticsreporting.googleapis.com/$discovery/rest?version=v4"],
  scope: [
    "https://www.googleapis.com/auth/drive"
  ].join(" ")
};

@NgModule({
  declarations: [
    AppComponent,
    SideListComponent,
    SiteHeaderComponent,
    MainViewComponent,
    CommentComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    GoogleApiModule.forRoot({
      provide: NG_GAPI_CONFIG,
      useValue: gapiClientConfig
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
