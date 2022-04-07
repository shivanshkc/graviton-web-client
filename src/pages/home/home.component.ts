import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription, timer } from 'rxjs';

import {
  defaultDotDiameter,
  defaultDotMass,
  defaultIncrementRatio,
  deltaTime,
  gravitationalConstant,
  maxDotDiameter,
} from '../../shared/constants';
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
  private _isDotBeingCreated = false;

  // Keeps track of whether the game is paused or running.
  public isPaused = false;

  // The observer that fires at each frame.
  private readonly _framesObservable = timer(0, deltaTime);
  private _framesSubscription?: Subscription;

  private readonly _githubLink = 'https://github.com/shivanshkc/graviton-web-client';
  private readonly _linkedInLink = 'https://www.linkedin.com/in/shivanshk/';

  constructor(
    private readonly _screen: ScreenResizeService,
    private readonly _iconReg: MatIconRegistry,
    private readonly _domSanitizer: DomSanitizer,
  ) {
    const githubIconURL = this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/svg/github.svg');
    const linkedInIconURL = this._domSanitizer.bypassSecurityTrustResourceUrl('/assets/svg/linkedin.svg');

    this._iconReg.addSvgIcon('github', githubIconURL);
    this._iconReg.addSvgIcon('linkedin', linkedInIconURL);
  }

  public async ngAfterViewInit(): Promise<void> {
    await sleep(0);

    // Subscribing to the observable for updating each frame.
    this._framesSubscription = this._framesObservable.subscribe(() => this._update());
    // If the game is not paused initially, the timer will be started.
    if (!this.isPaused) this.timer?.start();
  }

  public ngOnDestroy(): void {
    // Unsubscribing when the component is destroyed.
    this._framesSubscription?.unsubscribe();
    // Resetting the timer.
    this.timer?.reset();
  }

  /** Handler for mouse down event on the universe. */
  public onUniverseMouseDown(event: MouseEvent | TouchEvent): void {
    // If it is a mouse click, but not a left click, we ignore it.
    if (event instanceof MouseEvent && event.button !== 0) return;
    // All default touch actions and left-click actions are disabled.
    event.preventDefault();

    // Getting touch/click position.
    const posX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const posY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    // This position moves the center of the dot to the click position.
    const centeredPos = new Vector2(posX - defaultDotDiameter / 2, posY - defaultDotDiameter / 2);

    const dot = {
      color: getRandomColor(),
      mass: defaultDotMass,
      diameter: defaultDotDiameter,
      position: centeredPos,
      velocity: Vector2.zero,
    };

    this._isDotBeingCreated = true;
    this.dots.push(dot);
  }

  /** Handler for mouse up event on the universe. */
  public onUniverseMouseUp(): void {
    this._isDotBeingCreated = false;
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

  /** On-click handler for the GitHub button. */
  public onGithubClick(): void {
    window.open(this._githubLink, '_blank');
  }

  /** On-click handler for the LinkedIn button. */
  public onLinkedInClick(): void {
    window.open(this._linkedInLink, '_blank');
  }

  /** Updates each frame of the game. */
  private async _update(): Promise<void> {
    const newDots = [...this.dots];

    // Dot creation can happen even when the game is paused.
    if (this._isDotBeingCreated) {
      // Updating the properties of the dot that is being created.
      const dotBeingCreated = newDots[newDots.length - 1];

      // Dot's mass and dimensions do not exceed the max limit.
      if (dotBeingCreated.diameter < maxDotDiameter) {
        dotBeingCreated.mass += defaultDotMass * defaultIncrementRatio;

        // Storing the diameter change in a separate variable to keep the dot's center at the click position.
        const diaChange = defaultDotDiameter * defaultIncrementRatio;
        // Updating diameter.
        dotBeingCreated.diameter += diaChange;

        // Moving dot's center to the click position.
        dotBeingCreated.position = new Vector2(
          dotBeingCreated.position.x - diaChange / 2,
          dotBeingCreated.position.y - diaChange / 2,
        );
      }

      newDots[newDots.length - 1] = { ...dotBeingCreated };
    }

    // If the game is paused, we don't calculate movements.
    if (this.isPaused) {
      // Reassigning the dots to the trigger UI.
      this.dots = newDots;
      return;
    }

    // If a dot is being created, it is not considered part of the simulation.
    const offset = this._isDotBeingCreated ? 1 : 0;

    for (let i = 0; i < this.dots.length - offset; i++) {
      // This variable will hold the gravitation force on the dot due to
      // all other dots in the universe except itself.
      let resultantForce = Vector2.zero;

      for (let j = 0; j < this.dots.length - offset; j++) {
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
      const dot: Dot = { ...newDots[i] };
      // This call adjusts the newPosition so the dot remains within screen.
      dot.position = this._shiftScreenOverflow(newPosition);
      dot.velocity = newVelocity;

      // Populating the newDots array.
      newDots[i] = dot;
    }

    // Reassigning the dots to the trigger UI.
    this.dots = newDots;
  }

  /** Calculates the force of gravity between given dots. */
  private _gravityBetweenDots(dot1: Dot, dot2: Dot): Vector2 {
    const displacement = dot1.position.displacement(dot2.position);

    const displacementDir = displacement.direction();
    const displacementMag = displacement.magnitude();

    // When dots pass through each other, at one point the displacement becomes zero and the gravity becomes infinite.
    // That's why we cap the minimum possible displacement magnitude here.
    const minDisplacementMag = dot1.diameter / 2 + dot2.diameter / 2;
    if (minDisplacementMag > displacementMag) return Vector2.zero;

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
