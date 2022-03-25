import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';

import { Dot } from '../../shared/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  // List of dots that will be rendered.
  public readonly dots: Dot[] = [];

  // FPS of the game.
  private readonly _fps = 30;
  // The observer that fires at each frame.
  private readonly _framesObservable = timer(0, 1000 / this._fps);
  private _framesSubscription?: Subscription;

  constructor() {}

  public ngOnInit(): void {
    // Subscribing to the observable for updating each frame.
    this._framesSubscription = this._framesObservable.subscribe(() => this._update());
  }

  public ngOnDestroy(): void {
    // Unsubscribing when the component is destroyed.
    this._framesSubscription?.unsubscribe();
  }

  /** Updates each frame of the game. */
  private async _update(): Promise<void> {}
}
