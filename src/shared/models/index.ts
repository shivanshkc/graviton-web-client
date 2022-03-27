/** Dot represents a gravitational body. */
import { Vector2 } from '../services/vector2';

export interface Dot {
  color: string;

  mass: number;
  diameter: number;

  position: Vector2;
  velocity: Vector2;
}
