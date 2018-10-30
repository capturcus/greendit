import { Component, OnInit, Pipe, PipeTransform, ViewChild } from '@angular/core';
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
    private utils: UtilsService,
    private reddit: RedditService
  ) { }

  ngOnInit() {
  }

  public setupPost(incomingPost) {
    if (incomingPost !== undefined) {
      this.post = incomingPost;
      this.reddit.getComments(this.post.data.name.slice(3)).subscribe((data) => {
        this.comments = data.body[1].data.children;
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
}
