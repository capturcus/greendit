import { Component, OnInit } from '@angular/core';
import { UtilsService } from '../utils.service';

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
  post;


  constructor(
    private utils: UtilsService
  ) { }

  ngOnInit() {
  }

  public setupPost(incomingPost) {
    this.post = incomingPost;
  }

  isImage(post) {
    for (var ext of IMG_EXTENSIONS) {
      if (post.data.url.endsWith(ext)) {
        return true;
      }
    }
    return false;
  }

  isVideo(post) {
    for (var ext of VIDEO_EXTENSIONS) {
      if (post.data.url.endsWith(ext)) {
        return true;
      }
    }
    return false;
  }
}
