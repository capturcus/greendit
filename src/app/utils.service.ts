import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  public colorLerp(max: number, val: number) {
    let quarter = max/4;
    if (val < (max*0.25)) {
      // b -> bg
      return {r: 0, g: 255*(val/quarter), b: 255}
    }
    if (val < (max*0.5)) {
      // bg -> g
      return {r: 0, g: 255, b: 255-((val-quarter)/quarter)*255}
    }
    if (val < (max*0.75)) {
      // g -> rg
      return {r: 255*((val-2*quarter)/quarter), g: 255, b: 0};
    }
    // rg -> r
    return {r: 255, g: 255-((val-3*quarter)/quarter)*255, b: 0}
  }

  public upvoteToColor(u) {
    let z = u/10000;
    let scaledX = -0.038095*z*z + 0.39048*z;
    let colors = this.colorLerp(1, scaledX);
    return `rgb(${colors.r}, ${colors.g}, ${colors.b}, 1)`;
  }
}
