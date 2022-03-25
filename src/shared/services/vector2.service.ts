import { Injectable } from '@angular/core';

import { Vector2 } from '../models';
import { SharedModule } from '../shared.module';

@Injectable({
  providedIn: SharedModule,
})
export class Vector2Service {
  constructor() {}

  /** Provides the displacement vector between two vectors. */
  public displacement(vec1: Vector2, vec2: Vector2): Vector2 {
    return { x: vec1.x - vec2.x, y: vec1.y - vec2.y };
  }

  /** Provides the magnitude of the given vector. */
  public magnitude(vec: Vector2): number {
    return Math.sqrt(vec.x * vec.x + vec.y * vec.y);
  }

  /** Adds two vectors. */
  public add(vec1: Vector2, vec2: Vector2): Vector2 {
    return { x: vec1.x + vec2.x, y: vec1.y + vec2.y };
  }

  /** Multiplies the vector by the provided constant. */
  public multiply(vec: Vector2, c: number): Vector2 {
    return { x: vec.x * c, y: vec.y * c };
  }

  /** Divides the vector by the provided constant. */
  public divide(vec: Vector2, c: number): Vector2 {
    return { x: vec.x / c, y: vec.y / c };
  }
}
