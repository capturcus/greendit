import { Component, OnInit, ViewChild } from '@angular/core';
import { RedditService } from '../reddit.service';
import { GoogleService } from '../google.service';
import { RequestInterceptor } from '../interceptor';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.css']
})
export class SiteHeaderComponent implements OnInit {

  post: any = {data:{}};

  @ViewChild('header')
  private headerElement;

  constructor(
    private reddit: RedditService,
    private google: GoogleService,
    private interceptor: RequestInterceptor
  ) { }

  ngOnInit() {}

  tryReddit() {
    console.log("logging in to reddit");
    if(this.reddit.login()) {
      this.google.signInIfNecessary();
    }
  }

  public setupPost(incomingPost) {
    if (incomingPost !== undefined) {
      this.post = incomingPost;
      this.headerElement.nativeElement.scrollIntoView();
    }
  }

  debugInterceptor() {
    this.interceptor.releaseTokenQueue();
  }
}
