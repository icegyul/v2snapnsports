import type { ManagerRole } from "./contracts";
import type { ManagerCapability, ScopeType } from "./manager-contracts";

export type RouteAudience = "PUBLIC" | "AUTHENTICATED" | "GUARDIAN_INVITE";
export type AppArea = "AUTH" | "PLAYER" | "COMMUNITY" | "MANAGER";

export interface AppRoute {
  readonly id: string;
  readonly path: string;
  readonly area: AppArea;
  readonly audience: RouteAudience;
  readonly label: string;
  readonly requiredManagerRole: ManagerRole | null;
  readonly requiredCapability: ManagerCapability | null;
  readonly requiredScopeType: ScopeType | null;
  readonly scopeParam: string | null;
  readonly requiresVerifiedRoleGrant: boolean;
}

const publicRoute = (
  id: string,
  path: string,
  label: string,
  audience: RouteAudience = "PUBLIC",
): AppRoute => ({
  id,
  path,
  area: "AUTH",
  audience,
  label,
  requiredManagerRole: null,
  requiredCapability: null,
  requiredScopeType: null,
  scopeParam: null,
  requiresVerifiedRoleGrant: false,
});

const playerRoute = (id: string, path: string, label: string): AppRoute => ({
  id,
  path,
  area: "PLAYER",
  audience: "AUTHENTICATED",
  label,
  requiredManagerRole: null,
  requiredCapability: null,
  requiredScopeType: null,
  scopeParam: null,
  requiresVerifiedRoleGrant: false,
});

const communityRoute = (id: string, path: string, label: string): AppRoute => ({
  id,
  path,
  area: "COMMUNITY",
  audience: "AUTHENTICATED",
  label,
  requiredManagerRole: null,
  requiredCapability: null,
  requiredScopeType: null,
  scopeParam: null,
  requiresVerifiedRoleGrant: false,
});

const managerRoute = (
  id: string,
  path: string,
  label: string,
  role: ManagerRole,
  capability: ManagerCapability | null,
  scopeType: ScopeType,
  scopeParam: string | null,
): AppRoute => ({
  id,
  path,
  area: "MANAGER",
  audience: "AUTHENTICATED",
  label,
  requiredManagerRole: role,
  requiredCapability: capability,
  requiredScopeType: scopeType,
  scopeParam,
  requiresVerifiedRoleGrant: true,
});

export const AUTH_ROUTES: readonly AppRoute[] = [
  publicRoute("login", "/login", "로그인"),
  publicRoute("signup-role", "/signup/role", "가입 역할 선택"),
  publicRoute("guardian-invite", "/invite/guardian/:inviteId", "보호자 초대", "GUARDIAN_INVITE"),
];

export const PLAYER_ROUTES: readonly AppRoute[] = [
  playerRoute("player-stadium", "/home", "나의 경기장"),
  playerRoute("player-pitch-entry", "/home/enter", "피치 진입"),
  playerRoute("player-position", "/home/position", "나의 포지션"),
  playerRoute("player-spatial-home", "/home/team", "나의 팀 공간"),
  playerRoute("player-training", "/training", "훈련"),
  playerRoute("player-video", "/video", "영상"),
  playerRoute("player-career", "/player/career", "커리어 패스포트"),
  playerRoute("player-more", "/more", "더보기"),
];

export const COMMUNITY_ROUTES: readonly AppRoute[] = [
  communityRoute("community-feed", "/community", "커뮤니티"),
  communityRoute("community-search", "/community/search", "커뮤니티 검색"),
  communityRoute("community-post-detail", "/community/posts/:postId", "게시글 상세"),
  communityRoute("community-write", "/community/write", "글쓰기"),
  communityRoute("community-edit", "/community/posts/:postId/edit", "글 수정"),
  communityRoute("community-report", "/community/reports/new", "신고하기"),
  communityRoute("community-blocks", "/community/settings/blocks", "차단한 사용자"),
  communityRoute("community-hidden", "/community/settings/hidden", "숨긴 게시글"),
  communityRoute("community-news", "/community/news", "스포츠 뉴스"),
  communityRoute("community-news-detail", "/community/news/:newsId", "뉴스 상세"),
  communityRoute("community-youtube", "/community/videos/youtube", "YouTube 영상"),
  communityRoute("community-youtube-detail", "/community/videos/youtube/:videoId", "YouTube 영상 상세"),
  communityRoute("community-highlights", "/community/highlights", "경기 하이라이트"),
  communityRoute("community-highlight-detail", "/community/highlights/:highlightId", "하이라이트 상세"),
  communityRoute("community-predictions", "/community/predictions", "승부예측"),
  communityRoute("community-prediction-detail", "/community/predictions/:predictionId", "승부예측 상세"),
  communityRoute("community-leaderboard", "/community/leaderboard", "예측 리더보드"),
  communityRoute("community-development", "/community/development", "개발요청"),
  communityRoute("community-development-detail", "/community/development/:requestId", "개발요청 상세"),
];

export const COACH_ROUTES: readonly AppRoute[] = [
  managerRoute("coach-ground", "/manager/coach/ground", "그라운드", "COACH", "TEAM_READ", "TEAM", "teamId"),
  managerRoute("coach-plan", "/manager/coach/plan", "계획", "COACH", "TEAM_READ", "TEAM", "teamId"),
  managerRoute("coach-session", "/manager/coach/sessions", "세션", "COACH", "SESSION_MANAGE", "TEAM", "teamId"),
  managerRoute("coach-review", "/manager/coach/reviews", "리뷰", "COACH", "TEAM_READ", "TEAM", "teamId"),
  managerRoute("coach-more", "/manager/coach/more", "더보기", "COACH", null, "TEAM", "teamId"),
];

export const TEAM_MANAGER_ROUTES: readonly AppRoute[] = [
  managerRoute("team-manager-home", "/manager/team/home", "홈", "TEAM_MANAGER", "TEAM_READ", "TEAM", "teamId"),
  managerRoute("team-manager-schedule", "/manager/team/schedule", "일정", "TEAM_MANAGER", "TEAM_READ", "TEAM", "teamId"),
  managerRoute("team-manager-squad", "/manager/team/squad", "선수단", "TEAM_MANAGER", "TEAM_READ", "TEAM", "teamId"),
  managerRoute("team-manager-comms", "/manager/team/comms", "소통", "TEAM_MANAGER", "TEAM_READ", "TEAM", "teamId"),
  managerRoute("team-manager-more", "/manager/team/more", "더보기", "TEAM_MANAGER", null, "TEAM", "teamId"),
];

export const CLUB_DIRECTOR_ROUTES: readonly AppRoute[] = [
  managerRoute("club-director-home", "/manager/club/home", "클럽", "CLUB_DIRECTOR", "CLUB_READ", "CLUB", "clubId"),
  managerRoute("club-director-teams", "/manager/club/teams", "팀", "CLUB_DIRECTOR", "CLUB_READ", "CLUB", "clubId"),
  managerRoute("club-director-people", "/manager/club/people", "구성원", "CLUB_DIRECTOR", "CLUB_PEOPLE_READ", "CLUB", "clubId"),
  managerRoute("club-director-business", "/manager/club/business", "비즈니스", "CLUB_DIRECTOR", "CLUB_BUSINESS_READ", "CLUB", "clubId"),
  managerRoute("club-director-more", "/manager/club/more", "더보기", "CLUB_DIRECTOR", null, "CLUB", "clubId"),
];

export const REFEREE_ROUTES: readonly AppRoute[] = [
  managerRoute("referee-home", "/manager/referee/home", "홈", "REFEREE", "MATCH_ASSIGNMENT_READ", "MATCH", null),
  managerRoute("referee-matches", "/manager/referee/matches", "경기", "REFEREE", "MATCH_ASSIGNMENT_READ", "MATCH", null),
  managerRoute("referee-match-center", "/manager/referee/match-center/:matchId", "매치 센터", "REFEREE", "MATCH_CENTER_OPERATE", "MATCH", "matchId"),
  managerRoute("referee-reports", "/manager/referee/reports", "보고서", "REFEREE", "MATCH_ASSIGNMENT_READ", "MATCH", null),
  managerRoute("referee-more", "/manager/referee/more", "더보기", "REFEREE", null, "MATCH", null),
];

export const AGENT_ROUTES: readonly AppRoute[] = [
  managerRoute("agent-home", "/manager/agent/home", "홈", "AGENT", "AGENT_PLAYER_READ", "PLAYER", null),
  managerRoute("agent-players", "/manager/agent/players", "선수", "AGENT", "AGENT_PLAYER_READ", "PLAYER", null),
  managerRoute("agent-player-detail", "/manager/agent/players/:playerId", "선수 상세", "AGENT", "AGENT_PLAYER_READ", "PLAYER", "playerId"),
  managerRoute("agent-opportunities", "/manager/agent/opportunities", "기회", "AGENT", "AGENT_PLAYER_READ", "PLAYER", null),
  managerRoute("agent-schedule", "/manager/agent/schedule", "일정", "AGENT", "AGENT_PLAYER_READ", "PLAYER", null),
  managerRoute("agent-more", "/manager/agent/more", "더보기", "AGENT", null, "PLAYER", null),
];

export const ANALYST_ROUTES: readonly AppRoute[] = [
  managerRoute("analyst-home", "/manager/analyst/home", "홈", "ANALYST", "ANALYTICS_WORKSPACE_READ", "DATA_SOURCE", null),
  managerRoute("analyst-workspace", "/manager/analyst/workspace", "워크스페이스", "ANALYST", "ANALYTICS_WORKSPACE_READ", "DATA_SOURCE", "sourceId"),
  managerRoute("analyst-reports", "/manager/analyst/reports", "리포트", "ANALYST", "ANALYTICS_WORKSPACE_READ", "DATA_SOURCE", null),
  managerRoute("analyst-data-scope", "/manager/analyst/data-scope", "데이터 범위", "ANALYST", "ANALYTICS_WORKSPACE_READ", "DATA_SOURCE", null),
  managerRoute("analyst-more", "/manager/analyst/more", "더보기", "ANALYST", null, "DATA_SOURCE", null),
];

export const APP_ROUTES: readonly AppRoute[] = [
  ...AUTH_ROUTES,
  ...PLAYER_ROUTES,
  ...COMMUNITY_ROUTES,
  ...COACH_ROUTES,
  ...TEAM_MANAGER_ROUTES,
  ...CLUB_DIRECTOR_ROUTES,
  ...REFEREE_ROUTES,
  ...AGENT_ROUTES,
  ...ANALYST_ROUTES,
];

