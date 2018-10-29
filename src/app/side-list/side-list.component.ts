import {Component, OnInit, HostListener, ViewChild, ElementRef} from '@angular/core';
import {RedditService} from '../reddit.service';
import {UtilsService} from '../utils.service';
import {Subject, timer} from 'rxjs';
import { timeout } from 'rxjs/internal/operators';

@Component({selector: 'app-side-list', templateUrl: './side-list.component.html', styleUrls: ['./side-list.component.css']})
export class SideListComponent implements OnInit {

  posts;
  selectedPost : number = 0;

  wasPostSelected: boolean = false;

  public clickedPostSubject : Subject < any > = new Subject < any > ();

  constructor(
    private reddit : RedditService,
    private utils : UtilsService,
    private elementRef: ElementRef
    ) {}

  ngOnInit() {
    this.reddit.getPosts().subscribe((data) => {
        this.posts = data.data.children;
        this.selectPost(0);
      })
  }

  formatScore(score) {
    let s = Number(score);
    if (s >= 10000) {
      return (s / 1000).toFixed(1) + "k";
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
    if (post.data.thumbnail === "default") {
      return "/assets/snoo.png";
    }
    return post.data.thumbnail;
  }

  selectPost(index : number) {
    this.selectedPost = index;
    this.clickedPostSubject.next(this.posts[this.selectedPost]);

    if (this.selectedPost === this.posts.length - 1) {
      this.getMorePosts();
    }
    this.wasPostSelected = true;
  }

  private getMorePosts() {
    this
      .reddit
      .getPosts()
      .subscribe((data) => {
        this.posts = this
          .posts
          .concat(data.data.children);
      })
  }

  public stepPost(step : number) {
    let newPostNumber = this.selectedPost + step;
    if (newPostNumber >= 0 && newPostNumber < this.posts.length) {
      this.selectPost(newPostNumber);
    }
  }

  ngAfterViewInit() {
    this.elementRef.nativeElement.querySelector('#siemka')
                                  .addEventListener('scroll', () => {
                                    console.log("scroll");
                                  });
   }

  ngAfterViewChecked() {
    let el = document.getElementsByClassName("selected");
    if (el.length > 0 && this.wasPostSelected) {
      this.wasPostSelected = false;
      el.item(0).scrollIntoView({behavior: "instant", block: "center", inline: "nearest"});
    }
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

  dumpPost(post) {
    console.log("DUMP POST", post);
  }
}
