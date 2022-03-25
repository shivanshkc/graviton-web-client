import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscriber, Subscription, timer } from 'rxjs';

import { defaultDotDiameter, defaultDotMass, deltaTime, gravitationalConstant } from '../../shared/constants';
import { Dot, Vector2 } from '../../shared/models';
import { Vector2Service } from '../../shared/services/vector2.service';
import { getRandomColor } from '../../shared/utils/fmt-utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  // List of dots that will be rendered.
  public readonly dots: Dot[] = [];

  // The observer that fires at each frame.
  private readonly _framesObservable = timer(0, deltaTime);
  private _framesSubscription?: Subscription;

  private readonly _dotSubscribers: Subscriber<void>[] = [];

  constructor(private readonly _vector2: Vector2Service) {}

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

    const onUpdate = new Observable<void>((subscriber) => {
      this._dotSubscribers.push(subscriber);
    });

    this.dots.push({ color, mass: defaultDotMass, diameter: defaultDotDiameter, position, velocity, onUpdate });
  }

  /** Updates each frame of the game. */
  private async _update(): Promise<void> {
    for (let i = 0; i < this.dots.length; i++) {
      // This variable will hold the gravitation force on the dot due to
      // all other dots in the universe except itself.
      let resultantForce: Vector2 = { x: 0, y: 0 };

      for (let j = 0; j < this.dots.length; j++) {
        // A dot does not affect itself.
        if (i === j) continue;

        const thisForce = this._gravityBetweenDots(this.dots[j], this.dots[i]);
        resultantForce = this._vector2.add(resultantForce, thisForce);
      }

      const acceleration = this._vector2.divide(resultantForce, this.dots[i].mass);
      const positionDiff = this._secondLawOfMotion(this.dots[i].velocity, deltaTime, acceleration);

      const newPosition = this._vector2.add(this.dots[i].position, positionDiff);

      const newVelocity = this._firstLawOfMotion(this.dots[i].velocity, acceleration, deltaTime);

      this.dots[i].position = newPosition;
      this.dots[i].velocity = newVelocity;

      // Triggering dot update.
      this._dotSubscribers[i].next();
    }
  }

  /** Calculates the force of gravity between given dots. */
  private _gravityBetweenDots(dot1: Dot, dot2: Dot): Vector2 {
    const displacement = this._vector2.displacement(dot1.position, dot2.position);

    const displacementMag = this._vector2.magnitude(displacement);
    // If the dots are touching, gravity is ignored.
    if (displacementMag < dot1.diameter / 2 + dot2.diameter / 2) return { x: 0, y: 0 };

    const displaceMagCube = Math.pow(displacementMag, 3);

    const coefficient = (gravitationalConstant * dot1.mass * dot2.mass) / displaceMagCube;
    return this._vector2.multiply(displacement, coefficient);
  }

  /** Applies Newton's second law of motion. */
  private _secondLawOfMotion(u: Vector2, t: number, a: Vector2): Vector2 {
    const ut = this._vector2.multiply(u, t);
    const at2 = this._vector2.multiply(a, 0.5 * t * t);

    return this._vector2.add(ut, at2);
  }

  /** Applies Newton's first law of motion. */
  private _firstLawOfMotion(u: Vector2, a: Vector2, t: number): Vector2 {
    const at = this._vector2.multiply(a, t);
    return this._vector2.add(u, at);
  }
}
