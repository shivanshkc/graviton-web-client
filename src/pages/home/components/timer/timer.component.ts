import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';

import { twoDigitFormat } from '../../../../shared/utils/fmt-utils';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, OnDestroy {
  // State of the timer.
  private _state: 'stopped' | 'running' = 'stopped';

  // This var keeps track of the absolute number of seconds passed.
  private _totalSecondsElapsed = 0;
  // These vars store the time to be displayed on the UI.
  public displayMinutesElapsed = '00';
  public displaySecondsElapsed = '00';

  // Refresh interval for the timer.
  private readonly _timerIntervalMS = 100;

  // Observable for updating the UI timer.
  private readonly _timerObservable = timer(0, this._timerIntervalMS);
  private _timerSubscription?: Subscription;

  constructor() {}

  public ngOnInit(): void {
    this._timerSubscription = this._timerObservable.subscribe(() => {
      if (this._state !== 'running') return;

      this._totalSecondsElapsed += this._timerIntervalMS / 1000;
      this.displayMinutesElapsed = twoDigitFormat(Math.floor(this._totalSecondsElapsed / 60));
      this.displaySecondsElapsed = twoDigitFormat(Math.floor(this._totalSecondsElapsed % 60));
    });
  }

  public ngOnDestroy(): void {
    this._timerSubscription?.unsubscribe();
  }

  /** Starts or resumes the timer. */
  public start(): void {
    this._state = 'running';
  }

  /** Stops or pauses the timer. */
  public stop(): void {
    this._state = 'stopped';
  }

  /** Stops and resets the timer to zero. */
  public reset(): void {
    this._totalSecondsElapsed = 0;
    this.displayMinutesElapsed = '00';
    this.displaySecondsElapsed = '00';

    this._state = 'stopped';
  }
}
