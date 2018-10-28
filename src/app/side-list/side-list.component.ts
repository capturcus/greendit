import { Component, OnInit, HostListener } from '@angular/core';
import { RedditService } from '../reddit.service';
import { UtilsService } from '../utils.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-side-list',
  templateUrl: './side-list.component.html',
  styleUrls: ['./side-list.component.css']
})
export class SideListComponent implements OnInit {

  posts;
  selectedPost: number = 0;

  public clickedPostSubject: Subject<any> = new Subject<any>();

  constructor(
    private reddit: RedditService,
    private utils: UtilsService
  ) { }

  ngOnInit() {
    console.log("subscribing");
    this.reddit.getPosts().subscribe((data)=>{
      this.posts = data.data.children;
      this.selectPost(0);
    })
  }

  formatScore(score){
    let s = Number(score);
    if (s >= 10000) {
      return (s/1000).toFixed(1)+"k";
    }
    return score;
  }

  getThumbnailUrl(post) {
    if (post.data.thumbnail === "image") {
      return post.data.url;
    }
    if (post.data.thumbnail === "nsfw") {
      return "/assets/nsfw.png";
    }
    return post.data.thumbnail;
  }

  selectPost(index: number) {
    this.selectedPost = index;
    this.clickedPostSubject.next(this.posts[this.selectedPost]);
  }

  public stepPost(step: number) {
    let newPostNumber = this.selectedPost+step;
    if (newPostNumber >= 0 && newPostNumber < this.posts.length) {
      this.selectPost(newPostNumber);
    }
  }

  ngAfterViewChecked() {
    let el = document.getElementsByClassName("selected");
    el.item(0).scrollIntoView({behavior: "instant", block: "center", inline: "nearest"});
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    if (event.key == "ArrowLeft") {
      this.stepPost(-1);
    }
    if (event.key == "ArrowRight") {
      this.stepPost(1);
    }
  }
}
