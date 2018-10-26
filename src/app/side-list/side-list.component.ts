import { Component, OnInit } from '@angular/core';
import { RedditService } from '../reddit.service';

@Component({
  selector: 'app-side-list',
  templateUrl: './side-list.component.html',
  styleUrls: ['./side-list.component.css']
})
export class SideListComponent implements OnInit {

  posts;

  constructor(
    private reddit: RedditService
  ) { }

  ngOnInit() {
    console.log("subscribing");
    this.reddit.getPosts().subscribe((data)=>{
      this.posts = data.data.children;
    })
  }

  formatScore(score){
    let s = Number(score);
    if (s >= 10000) {
      return (s/1000).toFixed(1)+"k";
    }
    return score;
  }
}
