import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, timer } from 'rxjs';

import { defaultDotDiameter, defaultDotMass, deltaTime, gravitationalConstant } from '../../shared/constants';
import { Dot, Vector2 } from '../../shared/models';
import { ScreenResizeService } from '../../shared/services/screen-resize.service';
import { Vector2Service } from '../../shared/services/vector2.service';
import { getRandomColor } from '../../shared/utils/fmt-utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  // List of dots that will be rendered.
  public dots: Dot[] = [];

  // The observer that fires at each frame.
  private readonly _framesObservable = timer(0, deltaTime);
  private _framesSubscription?: Subscription;

  constructor(private readonly _vector2: Vector2Service, private readonly _screen: ScreenResizeService) {}

  public ngOnInit(): void {
    // Subscribing to the observable for updating each frame.
    this._framesSubscription = this._framesObservable.subscribe(() => this._update());
  }

  public ngOnDestroy(): void {
    // Unsubscribing when the component is destroyed.
    this._framesSubscription?.unsubscribe();
  }

  /** On-click handler for the universe div. */
  public onUniverseClick(event: MouseEvent): void {
    const color = getRandomColor();

    const position: Vector2 = { x: event.clientX, y: event.clientY };
    const velocity: Vector2 = { x: 0, y: 0 };

    this.dots.push({ color, mass: defaultDotMass, diameter: defaultDotDiameter, position, velocity });
  }

  /** Updates each frame of the game. */
  private async _update(): Promise<void> {
    const newDots: Dot[] = [];

    for (let i = 0; i < this.dots.length; i++) {
      // This variable will hold the gravitation force on the dot due to
      // all other dots in the universe except itself.
      let resultantForce: Vector2 = { x: 0, y: 0 };

      for (let j = 0; j < this.dots.length; j++) {
        // A dot does not affect itself.
        if (i === j) continue;

        const thisForce = this._gravityBetweenDots(this.dots[i], this.dots[j]);
        resultantForce = this._vector2.sum(resultantForce, thisForce);
      }

      const acceleration = this._vector2.divide(resultantForce, this.dots[i].mass);
      const positionDiff = this._secondLawOfMotion(this.dots[i].velocity, deltaTime, acceleration);

      const newPosition = this._vector2.sum(this.dots[i].position, positionDiff);
      const newVelocity = this._firstLawOfMotion(this.dots[i].velocity, acceleration, deltaTime);

      // Creating the new dot.
      const dot: Dot = { ...this.dots[i] };
      dot.position = this._shiftScreenOverflow(newPosition);
      dot.velocity = newVelocity;

      newDots.push(dot);
    }

    // Reassigning the dots to trigger UI.
    this.dots = newDots;
  }

  /** Calculates the force of gravity between given dots. */
  private _gravityBetweenDots(dot1: Dot, dot2: Dot): Vector2 {
    const displacement = this._vector2.displacement(dot1.position, dot2.position);

    const displacementDir = this._vector2.direction(displacement);
    const displacementMag = this._vector2.magnitude(displacement);

    // Since we do not handle collisions, the gravity becomes infinite
    // when the dots pass through each other (displacement becomes zero).
    // This snippet below handles that "black-hole" case.
    const minDisplacementMag = dot1.diameter / 2 + dot2.diameter / 2;
    if (this._vector2.magnitude(displacement) <= minDisplacementMag) return { x: 0, y: 0 };

    const coefficient = (-1 * gravitationalConstant * dot1.mass * dot2.mass) / Math.pow(displacementMag, 1);
    return this._vector2.multiply(displacementDir, coefficient);
  }

  /** Applies Newton's second law of motion. */
  private _secondLawOfMotion(u: Vector2, t: number, a: Vector2): Vector2 {
    const ut = this._vector2.multiply(u, t);
    const at2 = this._vector2.multiply(a, 0.5 * t * t);

    return this._vector2.sum(ut, at2);
  }

  /** Applies Newton's first law of motion. */
  private _firstLawOfMotion(u: Vector2, a: Vector2, t: number): Vector2 {
    const at = this._vector2.multiply(a, t);
    return this._vector2.sum(u, at);
  }

  /** Keeps the provided position inside the screen. */
  private _shiftScreenOverflow(position: Vector2): Vector2 {
    if (position.x < 0) position.x = this._screen.currentWidth + position.x;
    else if (position.x > this._screen.currentWidth) position.x = position.x - this._screen.currentWidth;

    if (position.y < 0) position.y = this._screen.currentHeight + position.y;
    else if (position.y > this._screen.currentHeight) position.y = position.y - this._screen.currentHeight;

    return position;
  }
}
