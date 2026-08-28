/**
 * SNAPN SPORTS V2 — ROUTE CONTRACT
 *
 * Canonical precedence:
 * - v1.7 player routes are primary.
 * - Existing CORE UI /app/* paths are migration aliases only.
 * - User-requested scene-stage paths under /home are allowed as child routes
 *   because they do not replace /home and preserve direct URL/refresh tests.
 */

export const PLAYER_ROUTES = {
  home: '/home',
  homeApproach: '/home/approach',
  homeEnter: '/home/enter',
  homePosition: '/home/position',
  homeFormation: '/home/formation',
  homeTeam: '/home/team',

  training: '/training',
  trainingSession: (sessionId: string) => `/training/${encodeURIComponent(sessionId)}`,

  community: '/community',
  communityPost: (postId: string) => `/community/post/${encodeURIComponent(postId)}`,
  communityCompose: '/community/compose',

  video: '/video',
  videoDetail: (videoId: string) => `/video/${encodeURIComponent(videoId)}`,

  playerMe: '/player/me',
  careerPassport: '/player/me/career',
  careerSeason: (seasonId: string) => `/player/me/career/season/${encodeURIComponent(seasonId)}`,

  stadium: '/stadium',
  more: '/more',
} as const;

export const REQUESTED_ROUTE_REDIRECTS = {
  '/community/new': '/community/compose',
  '/player/career': '/player/me/career',
  '/app/home': '/home',
  '/app/training': '/training',
  '/app/community': '/community',
  '/app/video': '/video',
  '/app/more': '/more',
} as const;

export const PLAYER_BOTTOM_NAV_ROUTE = {
  HOME: PLAYER_ROUTES.home,
  TRAINING: PLAYER_ROUTES.training,
  COMMUNITY: PLAYER_ROUTES.community,
  VIDEO: PLAYER_ROUTES.video,
  MORE: PLAYER_ROUTES.more,
} as const;

export type RouteGuard =
  | 'SESSION_RESTORE'
  | 'ACCOUNT_STATE'
  | 'FEATURE_VISIBILITY'
  | 'VERIFIED_ROLE_GRANT'
  | 'TENANT_SCOPE'
  | 'SUBJECT_SCOPE'
  | 'CONSENT_AND_SAFEGUARDING'
  | 'ROUTE_LOAD';

export const ROUTE_GUARD_ORDER: RouteGuard[] = [
  'SESSION_RESTORE',
  'ACCOUNT_STATE',
  'FEATURE_VISIBILITY',
  'VERIFIED_ROLE_GRANT',
  'TENANT_SCOPE',
  'SUBJECT_SCOPE',
  'CONSENT_AND_SAFEGUARDING',
  'ROUTE_LOAD',
];

export function isPlayerPrimaryRoute(pathname: string): boolean {
  return (
    pathname === '/home' ||
    pathname.startsWith('/home/') ||
    pathname === '/training' ||
    pathname.startsWith('/training/') ||
    pathname === '/community' ||
    pathname.startsWith('/community/') ||
    pathname === '/video' ||
    pathname.startsWith('/video/') ||
    pathname === '/player/me' ||
    pathname.startsWith('/player/me/') ||
    pathname === '/stadium' ||
    pathname === '/more'
  );
}

export function resolveInvalidPlayerRoute(): string {
  return PLAYER_ROUTES.home;
}
