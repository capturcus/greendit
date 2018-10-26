import { Component, OnInit } from '@angular/core';
import { UtilsService } from '../utils.service';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.css']
})
export class MainViewComponent implements OnInit {

  slider: number;
  siemka;
  color = "green";

  constructor(
    private utils: UtilsService
  ) { }

  ngOnInit() {
  }
}
