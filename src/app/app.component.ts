import { Component } from '@angular/core';
import { RedditService } from './reddit.service';
import { GoogleService } from './google.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'greendit';

  constructor(
    private reddit: RedditService,
    private google: GoogleService
  ) {}

  ngOnInit() {
    this.reddit.init();
  }
}
