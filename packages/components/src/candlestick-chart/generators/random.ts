/**
 * Seeded random number generator
 * Uses Mulberry32 algorithm for reproducible randomness
 */
export class SeededRandom {
  private seed: number;

  public constructor(seed: number = Date.now()) {
    this.seed = seed;
  }

  /**
   * Generate next random number (0-1)
   */
  public next(): number {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Random number in range [min, max)
   */
  public range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Random integer in range [min, max]
   */
  public int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  /**
   * Random boolean with given probability
   */
  public boolean(probability: number = 0.5): boolean {
    return this.next() < probability;
  }

  /**
   * Random choice from array
   */
  public choice<T>(array: T[]): T {
    return array[this.int(0, array.length - 1)];
  }

  /**
   * Normal distribution (Box-Muller transform)
   */
  public normal(mean: number = 0, stdDev: number = 1): number {
    const u1 = this.next();
    const u2 = this.next();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  /**
   * Reset seed
   */
  public setSeed(seed: number): void {
    this.seed = seed;
  }
}

/**
 * Perlin noise generator for smooth random variations
 */
export class PerlinNoise {
  private permutation: number[];

  public constructor(seed: number = Date.now()) {
    const rng = new SeededRandom(seed);

    // Generate permutation table
    const p = Array.from({length: 256}, (_, i) => i);

    // Shuffle using seeded random
    for (let i = p.length - 1; i > 0; i--) {
      const j = rng.int(0, i);
      [p[i], p[j]] = [p[j], p[i]];
    }

    // Duplicate for easier indexing
    this.permutation = [...p, ...p];
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(a: number, b: number, t: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number): number {
    return (hash & 1) === 0 ? x : -x;
  }

  /**
   * Get 1D Perlin noise value at x
   */
  public noise(x: number): number {
    const X = Math.floor(x) & 255;
    x -= Math.floor(x);

    const u = this.fade(x);

    const a = this.permutation[X];
    const b = this.permutation[X + 1];

    return this.lerp(
      this.grad(this.permutation[a], x),
      this.grad(this.permutation[b], x - 1),
      u,
    );
  }

  /**
   * Octave noise - multiple frequencies combined
   */
  public octave(
    x: number,
    octaves: number = 4,
    persistence: number = 0.5,
  ): number {
    let total = 0;
    let frequency = 1;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      total += this.noise(x * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}

/**
 * Random walk generator
 */
export class RandomWalk {
  private rng: SeededRandom;
  private value: number;

  public constructor(startValue: number, seed?: number) {
    this.value = startValue;
    this.rng = new SeededRandom(seed);
  }

  /**
   * Take next step with given parameters
   */
  public step(
    drift: number = 0,
    volatility: number = 1,
    minValue?: number,
    maxValue?: number,
  ): number {
    const change = this.rng.normal(drift, volatility);
    this.value += change;

    // Clamp to bounds if provided
    if (minValue !== undefined) {
      this.value = Math.max(this.value, minValue);
    }
    if (maxValue !== undefined) {
      this.value = Math.min(this.value, maxValue);
    }

    return this.value;
  }

  /**
   * Get current value
   */
  public getValue(): number {
    return this.value;
  }

  /**
   * Reset to new value
   */
  public reset(value: number): void {
    this.value = value;
  }
}

/**
 * Mean reversion generator
 */
export class MeanReversion {
  private rng: SeededRandom;
  private value: number;
  private mean: number;

  public constructor(startValue: number, mean: number, seed?: number) {
    this.value = startValue;
    this.mean = mean;
    this.rng = new SeededRandom(seed);
  }

  /**
   * Take next step with mean reversion
   */
  public step(reversionSpeed: number = 0.1, volatility: number = 1): number {
    const drift = (this.mean - this.value) * reversionSpeed;
    const noise = this.rng.normal(0, volatility);
    this.value += drift + noise;
    return this.value;
  }

  public getValue(): number {
    return this.value;
  }

  public setMean(mean: number): void {
    this.mean = mean;
  }
}
