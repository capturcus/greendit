import { Component, OnInit, Pipe, PipeTransform, ViewChild, HostListener } from '@angular/core';
import { UtilsService } from '../utils.service';
import { RedditService } from '../reddit.service';

const IMG_EXTENSIONS = [".png", ".jpg", ".gif"];
const VIDEO_EXTENSIONS = [".gifv", ".webm", ".mp4"];

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
export class MainViewComponent implements OnInit {

  slider: number;
  siemka;
  color = "green";
  post: any = {data:{url:""}};
  comments: Array<any> = [];

  @ViewChild('player')
  private player;

  constructor(
    public utils: UtilsService,
    private reddit: RedditService
  ) { }

  ngOnInit() {
  }

  private _flattenCommentUps(comments) {
    let ups = [];
    for (let c of comments) {
      if (c.data.ups !== undefined) {
        ups.push(c.data.ups);
      } else {
        // more
      }
      if (c.data.replies !== undefined && c.data.replies.data !== undefined) {
        ups = ups.concat(this._flattenCommentUps(c.data.replies.data.children));
      }
    }
    return ups;
  }

  public setupPost(incomingPost) {
    if (incomingPost !== undefined) {
      this.post = incomingPost;
      this.comments = [];
      this.reddit.getComments(this.post.data.name.slice(3)).subscribe((data) => {
        let tempComments = data.body[1].data.children
        let comUps = this._flattenCommentUps(tempComments);
        this.utils.computeUpvoteMetricsComments(this.post.data.name, comUps);
        this.comments = tempComments;
      });
    }
  }

  isImage() {
    if (this.post.data.domain === "imgur.com") {
      // possibly image or video. for now assume image
      this.post.data.url = "http://i.imgur.com/" + this.post.data.url.split("/").slice(-1)[0] + ".jpg";
      this.post.data.domain = "i.imgur.com";
    }
    for (var ext of IMG_EXTENSIONS) {
      if (this.post.data.url.endsWith(ext)) {
        return true;
      }
    }
    return false;
  }

  isVideo() {
    if (this.post.data.domain === "v.redd.it") {
      if (this.post.data.secure_media !== null) {
        this.post.data.url = this.post.data.secure_media.reddit_video.fallback_url;
        return true;
      }
      if (this.post.data.crosspost_parent_list !== undefined){
        this.post.data.url = this.post.data.crosspost_parent_list[0].secure_media.reddit_video.fallback_url;
      }
      return true;
    }
    if (this.post.data.domain === "gfycat.com") {
      if (this.post.data.url.startsWith("https://giant.gfycat.com/")) {
        return true;
      }
      let id = this.post.data.url.split("/").slice(-1);
      this.post.data.url = "https://giant.gfycat.com/"+id+".webm";
      return true;
    }
    for (var ext of VIDEO_EXTENSIONS) {
      if (this.post.data.url.endsWith(ext)) {
        return true;
      }
    }
    return false;
  }

  isSelftext() {
    return this.post.data.is_self;
  }

  getVideoSrc() {
    if (this.post.data.domain === "i.imgur.com") {
      let arr = this.post.data.url.split(".");
      arr.splice(-1);
      let directLink = arr.join(".") + ".mp4";
      return directLink;
    }
    return this.post.data.url;
  }

  getVideoType() {
    if (this.post.data.domain === "gfycat.com") {
      return "video/webm";
    }
    // if (post.data.domain === "i.imgur.com") {
      return "video/mp4";
    // }
  }

  ngAfterViewChecked() {
    if (this.post !== undefined && this.isVideo()) {
      this.player.nativeElement.load();
    }
  }

  isLink() {
    return !this.isVideo() && !this.isImage() && !this.isSelftext();
  }

  titleClick() {
    if (this.isLink()) {
      window.open(this.post.data.url,'_blank');
    }
  }

  arrowClick(direction) {
    var e = new KeyboardEvent("keydown", {bubbles : true, cancelable : true, key : direction});
    document.dispatchEvent(e);
  }
  
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event) {
    if (event.key === " ") {
      event.preventDefault();
      window.open(this.post.data.url,'_blank');
    }
  }
}
