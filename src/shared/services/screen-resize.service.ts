import { ViewportRuler } from '@angular/cdk/overlay';
import { Injectable, NgZone } from '@angular/core';
import { Observable, Subscriber, Subscription } from 'rxjs';

import { SharedModule } from '../shared.module';

@Injectable({
  providedIn: SharedModule,
})
@Injectable({
  providedIn: SharedModule,
})
export class ScreenResizeService {
  public currentWidth: number = screen.width;
  public currentHeight: number = screen.height;

  /** Parameter to control the speed of event firing. */
  private readonly _throttleTimeMS = 200;

  private readonly _widthHeightObservable: Observable<{ width: number; height: number }>;
  private _widthHeightSubscriber?: Subscriber<{ width: number; height: number }>;

  constructor(private readonly _viewportRuler: ViewportRuler, private readonly _ngZone: NgZone) {
    // Creating the observable that will be given the screen resize events.
    this._widthHeightObservable = new Observable<{ width: number; height: number }>((subscriber) => {
      // Storing the subscriber separately for emitting the events.
      this._widthHeightSubscriber = subscriber;
    });

    // Listening to screen resize events.
    this._viewportRuler.change(this._throttleTimeMS).subscribe(() =>
      this._ngZone.run(() => {
        const { width, height } = this._viewportRuler.getViewportSize();

        this.currentWidth = width;
        this.currentHeight = height;
        this._widthHeightSubscriber?.next({ width, height });
      }),
    );
  }

  /**
   * This method can be used to listen to screen resize events.
   * @param next - Callback.
   */
  public subscribe(next: (value: { width: number; height: number }) => void): Subscription {
    return this._widthHeightObservable.subscribe(next);
  }
}
