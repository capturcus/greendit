import { Component, ViewChild, HostListener } from '@angular/core';
import { RedditService } from './reddit.service';
import { GoogleService } from './google.service';
import { SideListComponent } from './side-list/side-list.component';
import { MainViewComponent } from './main-view/main-view.component';
import { SiteHeaderComponent } from './site-header/site-header.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'greendit';

  @ViewChild(SideListComponent)
  private sideList: SideListComponent;
  @ViewChild(MainViewComponent)
  private mainView: MainViewComponent;
  @ViewChild(SiteHeaderComponent)
  private siteHeader: SiteHeaderComponent;

  constructor(
    private reddit: RedditService,
    private google: GoogleService
  ) { }

  ngOnInit() {
    this.reddit.init();

    this.sideList.clickedPostSubject.subscribe((post) => {
      this.mainView.setupPost(post);
      this.siteHeader.setupPost(post);
    })
  }
}
