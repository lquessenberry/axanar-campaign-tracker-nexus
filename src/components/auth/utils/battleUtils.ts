export const generateSafePosition = () => {
  let x, y;
  do {
    x = Math.random() * 100;
    y = Math.random() * 100;
    // Keep away from the center area where auth card is (roughly 30-70% of screen)
  } while (x > 25 && x < 75 && y > 20 && y < 80);
  return { x, y };
};

export const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

export const isInSafeZone = (x: number, y: number) => {
  return !(x > 25 && x < 75 && y > 20 && y < 80);
};

export const clampToViewport = (value: number, min: number = 5, max: number = 95) => {
  return Math.max(min, Math.min(max, value));
};

export const isOutsideAuthCard = (x: number, y: number) => {
  return !(x > 25 && x < 75 && y > 20 && y < 80);
};
