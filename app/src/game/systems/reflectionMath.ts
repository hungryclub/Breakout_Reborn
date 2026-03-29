export interface ReflectionVelocity {
  x: number;
  y: number;
  angleFromHorizontal: number;
}

export function getPaddleImpactRatio(
  ballX: number,
  paddleX: number,
  paddleWidth: number,
): number {
  const halfWidth = paddleWidth / 2;
  const rawRatio = (ballX - paddleX) / halfWidth;

  return Math.max(-1, Math.min(1, rawRatio));
}

export function isCollisionLocked(
  now: number,
  lastCollisionAt: number,
  lockMs: number,
): boolean {
  return now - lastCollisionAt < lockMs;
}

export function shouldProcessPaddleBounce(
  ballY: number,
  ballBottom: number,
  ballVelocityY: number,
  paddleY: number,
  paddleTop: number,
): boolean {
  return ballVelocityY > 0 && ballY < paddleY && ballBottom <= paddleTop + 24;
}

export function shouldForcePaddleBounce(
  ballX: number,
  ballTop: number,
  ballBottom: number,
  ballVelocityY: number,
  paddleX: number,
  paddleTop: number,
  paddleBottom: number,
  paddleWidth: number,
  ballRadius: number,
): boolean {
  const horizontalReach = paddleWidth / 2 + ballRadius;
  const overlapsHorizontally = Math.abs(ballX - paddleX) <= horizontalReach;
  const crossesPaddleBand = ballBottom >= paddleTop && ballTop <= paddleBottom + ballRadius;

  return ballVelocityY > 0 && overlapsHorizontally && crossesPaddleBand;
}

export function computePaddleBounceVelocity(
  impactRatio: number,
  speed: number,
  currentVelocityX: number,
  minAngleFromHorizontal: number,
  maxAngleFromHorizontal: number,
): ReflectionVelocity {
  const clampedRatio = Math.max(-1, Math.min(1, impactRatio));
  const angleFromHorizontal =
    maxAngleFromHorizontal -
    (maxAngleFromHorizontal - minAngleFromHorizontal) * Math.abs(clampedRatio);
  const radians = (angleFromHorizontal * Math.PI) / 180;
  const direction =
    clampedRatio === 0 ? (currentVelocityX >= 0 ? 1 : -1) : Math.sign(clampedRatio);

  return {
    x: Math.cos(radians) * speed * direction,
    y: -Math.sin(radians) * speed,
    angleFromHorizontal,
  };
}
