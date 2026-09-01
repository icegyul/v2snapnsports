import { useMemo } from "react";
import { Link } from "react-router-dom";
import { buildStadiumBoard, type StadiumBoardSource } from "./stadiumBoardModel";

/**
 * The stadium's ribbon board on the home screen: what is next, and the way
 * into the screen that owns it. This is where the match and training menus
 * live inside the stadium rather than only in the tab bar.
 */
export function StadiumBoard({ source, now }: { readonly source: StadiumBoardSource; readonly now?: string }) {
  const rows = useMemo(
    () => buildStadiumBoard(source, now ?? new Date().toISOString()),
    [now, source],
  );

  return (
    <nav className="stadium-board" aria-label="다음 일정">
      {rows.map((row) => (
        <Link
          key={row.kind}
          className="stadium-board-row"
          data-kind={row.kind}
          data-relation={row.relation}
          to={row.destination}
          aria-label={row.ariaLabel}
        >
          <span className="stadium-board-title">{row.title}</span>
          <span className="stadium-board-when">
            {row.dateText ? `${row.dateText} ${row.timeText}` : "일정 미정"}
          </span>
          <span className="stadium-board-badge">{row.badge}</span>
        </Link>
      ))}
    </nav>
  );
}
