import { Component, Input, OnInit } from '@angular/core';

import { Dot } from '../../models';

@Component({
  selector: 'app-dot',
  templateUrl: './dot.component.html',
  styleUrls: ['./dot.component.scss'],
})
export class DotComponent implements OnInit {
  @Input() dot?: Dot;

  public ngStyle: { [key: string]: unknown } = {};

  constructor() {}

  public ngOnInit(): void {
    if (!this.dot) return;

    this._setDotStyle();
  }

  private _setDotStyle(): void {
    if (!this.dot) return;

    this.ngStyle = {
      position: 'absolute',
      top: `${this.dot.position.y}px`,
      left: `${this.dot.position.x}px`,

      borderRadius: '50%',
      width: `${this.dot.diameter}px`,
      height: `${this.dot.diameter}px`,

      backgroundColor: this.dot.color,
    };
  }
}
