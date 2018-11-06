import { Component, OnInit, Input } from '@angular/core';
import { UtilsService } from '../utils.service';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

  @Input()
  comment: any;

  constructor(
    private utils: UtilsService
  ) { }

  ngOnInit() {
    /*if(this.comment.data.replies.data !== undefined) {
      console.log(this.comment.data.replies.data.children);
    }*/
  }

}
