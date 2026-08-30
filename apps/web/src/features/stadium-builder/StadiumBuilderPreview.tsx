import { useEffect, useRef, useState } from "react";
import { createStadiumWebglRenderer, type StadiumWebglRenderer } from "../../three/stadiumWebglV14";
import { stadiumBuilderDraftToRecipe, type StadiumBuilderDraft } from "./stadiumBuilderModel";

interface StadiumBuilderPreviewProps {
  readonly draft: StadiumBuilderDraft;
}

type PreviewState = "INITIALIZING" | "READY" | "FALLBACK";

export function StadiumBuilderPreview({ draft }: StadiumBuilderPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>("INITIALIZING");
  const [orbit, setOrbit] = useState(0);
  const orbitRef = useRef(0);
  const dragStartRef = useRef<number | null>(null);
  const orbitStartRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    rendererRef.current?.destroy();
    rendererRef.current = null;
    setPreviewState("INITIALIZING");
    if (!canvas) return;

    let renderer: StadiumWebglRenderer | null = null;
    try {
      renderer = createStadiumWebglRenderer(canvas, "FULL", stadiumBuilderDraftToRecipe(draft));
    } catch {
      renderer = null;
    }
    if (!renderer) {
      setPreviewState("FALLBACK");
      return;
    }

    rendererRef.current = renderer;
    setPreviewState("READY");
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      renderer?.render(orbitRef.current, 1);
    };
    resize();

    let observer: ResizeObserver | null = null;
    if (typeof window.ResizeObserver !== "undefined") {
      observer = new window.ResizeObserver(resize);
      observer.observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      renderer?.destroy();
      if (rendererRef.current === renderer) rendererRef.current = null;
    };
  }, [draft]);

  useEffect(() => {
    orbitRef.current = orbit;
    rendererRef.current?.render(orbit, 1);
  }, [orbit]);

  const pointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = event.clientX;
    orbitStartRef.current = orbitRef.current;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const pointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current === null) return;
    setOrbit(orbitStartRef.current + (event.clientX - dragStartRef.current) * 0.42);
  };

  const pointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStartRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className="stadium-builder-preview-panel" aria-label="경기장 Builder 3D 미리보기">
      <div className="stadium-builder-preview-head">
        <div>
          <span>LIVE PREVIEW</span>
          <strong>{draft.selectedPresetId}</strong>
        </div>
        <span className="stadium-builder-preview-state" data-preview-state={previewState}>{previewState === "READY" ? "FULL 3D" : previewState}</span>
      </div>
      <div
        className="stadium-builder-preview-stage"
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={pointerUp}
      >
        <canvas ref={canvasRef} className={`stadium-builder-preview-canvas ${previewState === "READY" ? "is-ready" : ""}`} />
        {previewState !== "READY" && (
          <div className="stadium-builder-preview-fallback">
            <strong>3D 미리보기를 사용할 수 없습니다.</strong>
            <span>설정값과 저장 기능은 계속 사용할 수 있습니다.</span>
          </div>
        )}
        <div className="stadium-builder-preview-hint">드래그해서 경기장을 둘러보세요</div>
      </div>
      <dl className="stadium-builder-preview-meta">
        <div><dt>BOWL</dt><dd>{draft.bowl.tierCount}단 · {draft.bowl.profile}</dd></div>
        <div><dt>ROOF</dt><dd>{Math.round(draft.roof.coverage * 100)}% · {draft.roof.profile}</dd></div>
        <div><dt>SEAT</dt><dd>{draft.seat.pattern} · {Math.round(draft.seat.fillDensity * 100)}%</dd></div>
        <div><dt>ENV</dt><dd>{draft.environment.profile}</dd></div>
      </dl>
    </section>
  );
}
