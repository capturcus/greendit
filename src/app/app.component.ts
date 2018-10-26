import { Component } from '@angular/core';
import { RedditService } from './reddit.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'greendit';

  constructor(
    private reddit: RedditService
  ) {

  }

  ngOnInit() {
    this.reddit.init();
  }
}
