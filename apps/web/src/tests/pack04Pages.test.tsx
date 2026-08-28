import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AppShell } from "../app/AppShell";
afterEach(cleanup);
describe("PACK 04 admin/ops routes", () => {
  it("shows the local-only admin overview and hard-gate state", () => { render(<AppShell initialPath="/admin" />); expect(screen.getByRole("heading", { name: "관리 운영 콘솔" })).toBeInTheDocument(); expect(screen.getByText(/EPTS.*활성화 불가/)).toBeInTheDocument(); });
  it("keeps moderation projection-only and migration production blocked", () => { render(<AppShell initialPath="/admin/moderation" />); fireEvent.click(screen.getByRole("button", { name: "로컬 검토 기록" })); expect(screen.getByRole("status")).toHaveTextContent("LOCAL_PROJECTION_ONLY"); render(<AppShell initialPath="/admin/migration" />); fireEvent.click(screen.getByRole("button", { name: "Production 실행 요청" })); expect(screen.getAllByRole("status").at(-1)).toHaveTextContent("PRODUCTION_BLOCKED"); });
  it("shows safeguarding restriction, privacy production block, and Earthus unavailable", () => { render(<AppShell initialPath="/admin/safeguarding" />); expect(screen.getByText(/case-level need-to-know/)).toBeInTheDocument(); render(<AppShell initialPath="/admin/privacy" />); fireEvent.click(screen.getByRole("button", { name: "삭제 workflow 검토" })); expect(screen.getAllByRole("status").at(-1)).toHaveTextContent("PRODUCTION_ACTION_BLOCKED"); render(<AppShell initialPath="/admin/earthus-health" />); expect(screen.getByText(/UNAVAILABLE/)).toBeInTheDocument(); });
});
