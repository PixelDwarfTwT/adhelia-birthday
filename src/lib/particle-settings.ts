const MOBILE_BREAKPOINT = 768;
const MOBILE_PARTICLE_LIMIT = 60;
const DESKTOP_PARTICLE_LIMIT = 140;

export function getParticleLimit(viewportWidth: number, reducedMotion: boolean): number {
  if (reducedMotion || viewportWidth <= 0) return 0;
  return viewportWidth <= MOBILE_BREAKPOINT ? MOBILE_PARTICLE_LIMIT : DESKTOP_PARTICLE_LIMIT;
}
