export interface AttachedBallPosition {
  x: number;
  y: number;
}

export interface LaunchVector {
  x: number;
  y: number;
}

export function getAttachedBallPosition(
  paddleX: number,
  paddleY: number,
  paddleHeight: number,
  ballRadius: number,
  attachOffset: number,
): AttachedBallPosition {
  return {
    x: paddleX,
    y: paddleY - paddleHeight / 2 - ballRadius - attachOffset,
  };
}

export function createInitialLaunchVector(
  speed: number,
  horizontalRatio: number,
): LaunchVector {
  const x = speed * horizontalRatio;
  const y = -Math.sqrt(speed * speed - x * x);

  return { x, y };
}
