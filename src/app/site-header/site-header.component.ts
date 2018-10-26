import { Component, OnInit } from '@angular/core';
import { RedditService } from '../reddit.service';
import { GoogleService } from '../google.service';

@Component({
  selector: 'app-site-header',
  templateUrl: './site-header.component.html',
  styleUrls: ['./site-header.component.css']
})
export class SiteHeaderComponent implements OnInit {

  constructor(
    private reddit: RedditService,
    private google: GoogleService
  ) { }

  ngOnInit() {}
}
