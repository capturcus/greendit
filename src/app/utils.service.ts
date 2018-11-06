import {Injectable} from '@angular/core';

const NEUTRAL = {
  r: 0.2989,
  g: 0.5870,
  b: 0.1140
};

const DESATURATION_AMOUNT = 0.1;

@Injectable({providedIn: 'root'})
export class UtilsService {

  constructor() {}

  public median : number = 0;
  public max : number = 0;
  public base : number = 0;

  public computeUpvoteMetrics(upvotes : Array < number >) {
    this.median = this.computeMedian(upvotes);
    this.max = upvotes.sort((a, b) => a - b).slice(-1)[0];
    this.base = Math.pow(this.median / this.max, 2);
  }

  public rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
  
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
  
    if (max == min) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
  
      h /= 6;
    }
  
    return [ h, s, l ];
  }

  hslToRgb(h, s, l) {
    var r, g, b;
  
    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      let hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      }
  
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
  
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
  
    return [ r * 255, g * 255, b * 255 ];
  }

  public lerp(min, max, amount) {
    return min+(max-min)*amount;
  }

  public interpolateColors(a, b, amount) {
    return {
      r: this.lerp(a.r, b.r, amount),
      g: this.lerp(a.g, b.g, amount),
      b: this.lerp(a.b, b.b, amount)
    }
  }

  public toGrayscale(c) {
    let lightness = c.r * NEUTRAL.r + c.g * NEUTRAL.g + c.b * NEUTRAL.b;
    return {
      r: lightness,
      g: lightness,
      b: lightness
    }
  }

  public desaturate(c) {
    let hsl = this.rgbToHsl(c.r, c.g, c.b);
    hsl[2] = this.lerp(hsl[2], 1, DESATURATION_AMOUNT);
    let rgb = this.hslToRgb(hsl[0], hsl[1], hsl[2]);
    return {
      r: rgb[0],
      g: rgb[1],
      b: rgb[2]
    }
  }

  public computeMedian(numbers) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    var median = 0,
      numsLen = numbers.length;
    numbers.sort((a, b) => a - b);

    if (numsLen % 2 === 0 // is even
    ) {
      // average of two middle numbers
      median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { // is odd
      // middle number only
      median = numbers[(numsLen - 1) / 2];
    }

    return median;
  }

  public colorLerp(max : number, val : number) {
    let quarter = max / 4;
    if (val < (max * 0.25)) {
      // b -> bg
      return {
        r: 0,
        g: 255 * (val / quarter),
        b: 255
      }
    }
    if (val < (max * 0.5)) {
      // bg -> g
      return {
        r: 0,
        g: 255,
        b: 255 - ((val - quarter) / quarter) * 255
      };
    }
    if (val < (max * 0.75)) {
      // g -> rg
      return {
        r: 255 * ((val - 2 * quarter) / quarter),
        g: 255,
        b: 0
      };
    }
    if (val <= max) {
      // rg -> r
      return {
        r: 255,
        g: 255 - ((val - 3 * quarter) / quarter) * 255,
        b: 0
      };
    }
    return {r: 255, g: 0, b: 0}
  }

  /*public computeCurveFactors(median : number, max : number) : Array < number > {
    let c1 = max*max;
    let c2 = max;
    let c3 = median*median;
    let c4 = median;
    let b = (0.5 * c1 - c3) / (c4 * c1 - c2 * c3);
    let a = (1 - b * c2) / c1;
    return [a, b];
  }*/

  public upvoteToColor(u) {
    /*let colors;
    if (u < max) {
      let scaledX = a * u * u + b * u;
      colors = this.colorLerp(1, scaledX);
    } else {
      colors = this.colorLerp(1, 1);
    }*/
    let scaled = 1 - Math.pow(this.base, u / this.max);
    let colors = this.colorLerp(1, scaled);
    colors = this.desaturate(colors);
    return `rgb(${colors.r}, ${colors.g}, ${colors.b}, 1)`;
  }

  formatScore(score) {
    let s = Number(score);
    if (s >= 10000) {
      return (s / 1000).toFixed(1) + "k";
    }
    return score;
  }
}
