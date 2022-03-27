export class Vector2 {
  public static readonly zero = new Vector2(0, 0);

  constructor(private _x: number, private _y: number) {}

  public get x(): number {
    return this._x;
  }
  public get y(): number {
    return this._y;
  }

  /** Provides a new vector which is the sum of this and the given vector. */
  public sum(vec: Vector2): Vector2 {
    return new Vector2(this._x + vec._x, this._y + vec._y);
  }

  /** Provides the displacement vector between this and the given vector. */
  public displacement(vec: Vector2): Vector2 {
    return new Vector2(this._x - vec._x, this._y - vec._y);
  }

  /** Provides the magnitude of this vector. */
  public magnitude(): number {
    return Math.sqrt(this._x * this._x + this._y * this._y);
  }

  /** Provides the direction of this vector. */
  public direction(): Vector2 {
    return this.divide(this.magnitude());
  }

  /** Provides a new vector which is this vector scaled up by the provided constant. */
  public multiply(c: number): Vector2 {
    return new Vector2(this._x * c, this._y * c);
  }

  /** Provides a new vector which is this vector scaled down by the provided constant. */
  public divide(c: number): Vector2 {
    return new Vector2(this._x / c, this._y / c);
  }
}
