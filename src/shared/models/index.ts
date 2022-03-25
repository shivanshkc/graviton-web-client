/** Dot represents a gravitational body. */
import { Observable } from 'rxjs';

export interface Dot {
  color: string;

  mass: number;
  diameter: number;

  position: Vector2;
  velocity: Vector2;

  onUpdate: Observable<void>;
}

/** Vector2 represents a 2D vector. */
export interface Vector2 {
  x: number;
  y: number;
}
