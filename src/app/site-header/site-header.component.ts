import { Component, OnInit } from '@angular/core';
import { RedditService } from '../reddit.service';
import { GoogleService } from '../google.service';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.css']
})
export class SiteHeaderComponent implements OnInit {

  post = {data:{}};

  constructor(
    private reddit: RedditService,
    private google: GoogleService
  ) { }

  ngOnInit() {}

  tryReddit() {
    console.log("logging in to reddit");
    if(this.reddit.login()) {
      this.google.signInIfNecessary();
    }
  }

  public setupPost(incomingPost) {
    this.post = incomingPost;
  }
}
