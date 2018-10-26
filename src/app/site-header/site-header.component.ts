import { Component, OnInit } from '@angular/core';
import { RedditService } from '../reddit.service';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.css']
})
export class SiteHeaderComponent implements OnInit {

  constructor(
    private reddit: RedditService
  ) { }

  ngOnInit() {
  }

  tryReddit() {
    this.reddit.login();
  }
}
