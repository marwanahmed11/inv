/**
 * Steady scene clock in seconds. React Three Fiber resets its own clock each time
 * rendering pauses (the scene pauses offscreen), so timelines use this instead.
 */
let start = 0;

export function resetSceneTime() {
  start = performance.now();
}

export function sceneTime() {
  return (performance.now() - start) / 1000;
}
