
export interface Blip {
  id: number;
  x: number;
  y: number;
  type: 'federation' | 'klingon';
  opacity: number;
  scale: number;
  targetX?: number;
  targetY?: number;
  isVisible?: boolean;
  formationIndex?: number;
}

export interface Laser {
  id: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
  opacity: number;
}

export interface Torpedo {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  color: string;
  opacity: number;
  type: 'klingon' | 'federation';
}

export interface Explosion {
  id: number;
  x: number;
  y: number;
  particles: Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    life: number;
    maxLife: number;
  }>;
}

export interface ReticleInfo {
  message: string;
  x: number;
  y: number;
  opacity: number;
}
