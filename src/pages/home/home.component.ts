import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { Subscription, timer } from 'rxjs';

import { defaultDotDiameter, defaultDotMass, deltaTime, gravitationalConstant } from '../../shared/constants';
import { Dot } from '../../shared/models';
import { ScreenResizeService } from '../../shared/services/screen-resize.service';
import { Vector2 } from '../../shared/services/vector2';
import { sleep } from '../../shared/utils';
import { getRandomColor } from '../../shared/utils/fmt-utils';
import { TimerComponent } from './components/timer/timer.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild(TimerComponent) timer?: TimerComponent;

  // List of dots that will be rendered.
  public dots: Dot[] = [];

  // Keeps track of whether the game is paused or running.
  public isPaused = false;

  // The observer that fires at each frame.
  private readonly _framesObservable = timer(0, deltaTime);
  private _framesSubscription?: Subscription;

  constructor(private readonly _screen: ScreenResizeService) {}

  public async ngAfterViewInit(): Promise<void> {
    await sleep(0);

    // Subscribing to the observable for updating each frame.
    this._framesSubscription = this._framesObservable.subscribe(() => this._update());
    // Starting the timer.
    this.timer?.start();
  }

  public ngOnDestroy(): void {
    // Unsubscribing when the component is destroyed.
    this._framesSubscription?.unsubscribe();
    // Resetting the timer.
    this.timer?.reset();
  }

  /** On-click handler for the universe div. */
  public onUniverseClick(event: MouseEvent): void {
    // Giving the dot a random color.
    const color = getRandomColor();

    // Spawning the dot at click location.
    const position = new Vector2(event.clientX, event.clientY);
    // Initial velocity is zero.
    const velocity = Vector2.zero;

    // Pushing to the dots array. This will show up in the UI due to the *ngFor.
    this.dots.push({ color, mass: defaultDotMass, diameter: defaultDotDiameter, position, velocity });
  }

  /** On-click handler for the play-pause button. */
  public onPlayClick(): void {
    // Toggling the paused state.
    this.isPaused = !this.isPaused;
    this.isPaused ? this.timer?.stop() : this.timer?.start();
  }

  /** On-click handler for the reset button. */
  public onResetClick(): void {
    // Destroying all dots.
    this.dots = [];
    // Pausing the game.
    this.isPaused = true;
    // Resetting the timer.
    this.timer?.reset();
  }

  /** Updates each frame of the game. */
  private async _update(): Promise<void> {
    // If game is paused, we do nothing.
    if (this.isPaused) return;

    const newDots: Dot[] = [];

    for (let i = 0; i < this.dots.length; i++) {
      // This variable will hold the gravitation force on the dot due to
      // all other dots in the universe except itself.
      let resultantForce = Vector2.zero;

      for (let j = 0; j < this.dots.length; j++) {
        // A dot does not affect itself.
        if (i === j) continue;

        const thisForce = this._gravityBetweenDots(this.dots[i], this.dots[j]);
        resultantForce = resultantForce.sum(thisForce);
      }

      const acceleration = resultantForce.divide(this.dots[i].mass);
      const positionDiff = this._secondLawOfMotion(this.dots[i].velocity, deltaTime, acceleration);

      const newPosition = this.dots[i].position.sum(positionDiff);
      const newVelocity = this._firstLawOfMotion(this.dots[i].velocity, acceleration, deltaTime);

      // Creating the new dot.
      const dot: Dot = { ...this.dots[i] };
      // This call adjusts the newPosition so the dot remains within screen.
      dot.position = this._shiftScreenOverflow(newPosition);
      dot.velocity = newVelocity;

      // Populating the newDots array.
      newDots.push(dot);
    }

    // Reassigning the dots to the trigger UI.
    this.dots = newDots;
  }

  /** Calculates the force of gravity between given dots. */
  private _gravityBetweenDots(dot1: Dot, dot2: Dot): Vector2 {
    const displacement = dot1.position.displacement(dot2.position);

    const displacementDir = displacement.direction();
    const displacementMag = displacement.magnitude();

    // Since we do not handle collisions, the gravity becomes infinite
    // when the dots pass through each other (displacement becomes zero).
    // This snippet below handles that "black-hole" case.
    const minDisplacementMag = dot1.diameter / 2 + dot2.diameter / 2;
    if (displacementMag <= minDisplacementMag) return Vector2.zero;

    const coefficient = (-1 * gravitationalConstant * dot1.mass * dot2.mass) / Math.pow(displacementMag, 1);
    return displacementDir.multiply(coefficient);
  }

  /** Applies Newton's second law of motion. */
  private _secondLawOfMotion(u: Vector2, t: number, a: Vector2): Vector2 {
    const ut = u.multiply(t);
    const at2 = a.multiply(0.5 * t * t);

    return ut.sum(at2);
  }

  /** Applies Newton's first law of motion. */
  private _firstLawOfMotion(u: Vector2, a: Vector2, t: number): Vector2 {
    const at = a.multiply(t);
    return u.sum(at);
  }

  /** Keeps the provided position inside the screen. */
  private _shiftScreenOverflow(position: Vector2): Vector2 {
    let newX = position.x;
    let newY = position.y;

    // Syntactical sugar.
    const { currentWidth, currentHeight } = this._screen;

    if (position.x < 0) newX = currentWidth + position.x;
    else if (position.x > currentWidth) newX = position.x - currentWidth;

    if (position.y < 0) newY = currentHeight + position.y;
    else if (position.y > currentHeight) newY = position.y - currentHeight;

    return new Vector2(newX, newY);
  }
}
