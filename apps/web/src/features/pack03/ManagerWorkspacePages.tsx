import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { createBrowserActiveRoleStore, createManagerWorkspaceSession, createMemoryActiveRoleStore, type WorkspaceRole } from "../../../../../packages/pack03/workspaces";
import { createManagerWorkspaceProducts } from "../../../../../packages/pack03/productWorkspace";

const grants = [
  { id: "coach", role: "COACH" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] },
  { id: "team-manager", role: "TEAM_MANAGER" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] },
  { id: "club-director", role: "CLUB_DIRECTOR" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] },
  { id: "referee", role: "REFEREE" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] },
  { id: "agent", role: "AGENT" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] },
  { id: "analyst", role: "ANALYST" as const, status: "VERIFIED" as const, tenantId: "tenant-a", clubId: "club-a", teamIds: ["team-a"] }
];
const rolePath: Record<WorkspaceRole, string> = { COACH: "/manager/coach", TEAM_MANAGER: "/manager/team", CLUB_DIRECTOR: "/manager/club", REFEREE: "/manager/referee", AGENT: "/manager/agent", ANALYST: "/manager/analyst" };
const roleHeading: Record<WorkspaceRole, string> = { COACH: "코치 워크스페이스", TEAM_MANAGER: "팀 매니저 워크스페이스", CLUB_DIRECTOR: "클럽 디렉터 워크스페이스", REFEREE: "심판 워크스페이스", AGENT: "에이전트 워크스페이스", ANALYST: "분석가 워크스페이스" };
const store = typeof localStorage === "undefined" ? createMemoryActiveRoleStore() : createBrowserActiveRoleStore();
const manager = createManagerWorkspaceSession({ actorUserId: "manager-a", tenantId: "tenant-a", teamIds: ["team-a"], accountState: "ACTIVE", rolePreference: "COACH", grants, consents: [{ purpose: "SCOUTING", athleteId: "athlete-a", status: "ACTIVE" }], guardianRelations: [], safeguardingBlocked: false, feature: "CORE" }, store);
const products = createManagerWorkspaceProducts(manager);

function RoleSwitcher() {
  const navigate = useNavigate();
  const [, refresh] = useState(0);
  return <nav aria-label="활성 역할 전환" className="role-grid">{grants.map((grant) => <button key={grant.id} type="button" onClick={() => { manager.switchActiveRole(grant.id); refresh((value) => value + 1); navigate(rolePath[grant.role]); }}>{grant.role} 역할로 전환</button>)}</nav>;
}
function WorkspaceFrame({ role, children }: { role: WorkspaceRole; children: ReactNode }) {
  try { if (manager.currentWorkspace().role !== role) throw new Error("ROLE_NOT_VERIFIED"); } catch { return <main className="shell-main"><h1>접근이 허용되지 않음</h1><p>현재 활성 VerifiedRoleGrant로는 이 작업 공간을 열 수 없습니다.</p><RoleSwitcher /></main>; }
  return <main className="shell-main"><p className="eyebrow">MANAGER WORKSPACE · FIXTURE LOCAL</p><h1>{roleHeading[role]}</h1><RoleSwitcher /><nav aria-label="작업 공간 탐색">{manager.currentWorkspace().navigation.map((item) => <span key={item}>{item}</span>)}</nav>{children}</main>;
}
export function ManagerHomePage() { return <main className="shell-main"><p className="eyebrow">MANAGER · FIXTURE LOCAL</p><h1>매니저 워크스페이스</h1><p>선호 역할은 권한이 아닙니다. VerifiedRoleGrant와 tenant/team/club scope만 권한을 결정합니다.</p><RoleSwitcher /></main>; }
export function CoachWorkspacePage() { const [status, setStatus] = useState(""); return <WorkspaceFrame role="COACH"><section className="surface-card"><h2>오늘의 세션</h2><p>웨어러블, 카메라, AI 데이터는 hard-disabled 상태입니다.</p><button onClick={() => setStatus(`세션 상태: ${products.startCoachSession().state}`)}>훈련 세션 시작</button><button onClick={() => setStatus(`계획 revision ${products.createCoachPlanRevision().version}`)}>계획 revision 생성</button><button onClick={() => setStatus(`출석: ${products.finalizeCoachAttendance().state}`)}>출석 확정</button>{status && <p role="status">{status}</p>}<p>일시 정지/재개는 DB 상태가 아닌 현장 timer control로만 처리합니다.</p></section></WorkspaceFrame>; }
export function TeamManagerWorkspacePage() { return <WorkspaceFrame role="TEAM_MANAGER"><section className="surface-card"><h2>운영 일정</h2>{products.teamSchedule().map((item) => <p key={item.id}>{item.type} · {item.startAt}</p>)}<p>훈련·경기 조율과 팀 운영 커뮤니케이션 projection입니다. 코치 전용 plan 수정은 포함하지 않습니다.</p></section></WorkspaceFrame>; }
export function ClubDirectorWorkspacePage() { const overview = products.clubOverview(); return <WorkspaceFrame role="CLUB_DIRECTOR"><section className="surface-card"><h2>클럽 운영 현황</h2><p>팀 {overview.teamCount} · 일정 {overview.scheduleCount}</p><p>선수 safeguarding/private data: {overview.privateAthleteData}</p></section></WorkspaceFrame>; }
export function RefereeWorkspacePage() { const [status, setStatus] = useState(""); return <WorkspaceFrame role="REFEREE"><section className="surface-card"><h2>배정 경기</h2><p>{products.refereeMatch().opponent}전 · exact assignment 확인됨</p><button onClick={() => setStatus(`리포트: ${products.submitRefereeReport().state}`)}>경기 리포트 제출</button>{status && <p role="status">{status}</p>}<p>선수 private training, career, guardian, media 데이터는 표시하지 않습니다.</p></section></WorkspaceFrame>; }
export function AgentWorkspacePage() { const [status, setStatus] = useState(""); return <WorkspaceFrame role="AGENT"><section className="surface-card"><h2>스카우팅 기회</h2><p>동의와 만료되지 않은 포트폴리오 범위를 통과한 projection만 사용합니다.</p><button onClick={() => setStatus(products.requestAgentOpportunity().route === "GUARDIAN_OR_CLUB_MEDIATED" ? "보호자 또는 구단 중재 경로" : "허용된 포트폴리오 경로")}>보호자 또는 구단 검토 요청</button>{status && <p role="status">{status}</p>}<p>미성년자 직접 연락과 AI career evaluation은 허용되지 않습니다.</p></section></WorkspaceFrame>; }
export function AnalystWorkspacePage() { const playback = products.analystPlayback(); return <WorkspaceFrame role="ANALYST"><section className="surface-card"><h2>전술 읽기 projection</h2><p>{playback.mode} playback · editable: {String(playback.editable)}</p><p>EPTS, CAMERA_AI, SPORTS_AI는 사용할 수 없으며 external intelligence failure는 fatal이 아닙니다.</p></section></WorkspaceFrame>; }
