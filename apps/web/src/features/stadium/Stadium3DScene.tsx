import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type WheelEvent } from "react";
import type { CoreVisualMode } from "../../api/coreProductContracts";
import { createStadiumScene, nextStadiumMode } from "../../three/stadiumScene";
import { createStadiumWebglRenderer, type StadiumWebglRenderer } from "../../three/stadiumWebgl";

interface Stadium3DSceneProps {
  readonly mode: CoreVisualMode;
  readonly onEnter: () => void;
}

type RenderState = "INITIALIZING" | "READY" | "FALLBACK";
type Point = { x: number; y: number };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function Stadium3DScene({ mode, onEnter }: Stadium3DSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const [effectiveMode, setEffectiveMode] = useState<CoreVisualMode>(mode);
  const [renderState, setRenderState] = useState<RenderState>(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
  const [orbit, setOrbit] = useState(0);
  const [zoom, setZoom] = useState(1);
  const orbitRef = useRef(orbit);
  const zoomRef = useRef(zoom);
  const pointersRef = useRef(new Map<number, Point>());
  const gestureRef = useRef({
    primaryId: null as number | null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    moved: false,
    pinched: false,
  });
  const pinchRef = useRef({ distance: 0, zoom: 1 });
  const suppressClickRef = useRef(false);

  const scene = createStadiumScene(effectiveMode);

  useEffect(() => {
    setEffectiveMode(mode);
    setRenderState(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
    setOrbit(0);
    setZoom(1);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    rendererRef.current?.destroy();
    rendererRef.current = null;

    if (!canvas || effectiveMode === "STATIC") {
      setRenderState("FALLBACK");
      return;
    }

    let renderer: StadiumWebglRenderer | null = null;
    try {
      renderer = createStadiumWebglRenderer(canvas, effectiveMode);
    } catch {
      renderer = null;
    }

    if (!renderer) {
      setRenderState("INITIALIZING");
      setEffectiveMode(nextStadiumMode(effectiveMode));
      return;
    }

    rendererRef.current = renderer;
    setRenderState("READY");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      renderer?.render(orbitRef.current, zoomRef.current);
    };
    resize();

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      rendererRef.current?.destroy();
      rendererRef.current = null;
      setRenderState("INITIALIZING");
      setEffectiveMode((current) => nextStadiumMode(current));
    };

    canvas.addEventListener("webglcontextlost", handleContextLost);
    let observer: ResizeObserver | null = null;
    if (typeof window.ResizeObserver !== "undefined") {
      observer = new window.ResizeObserver(resize);
      observer.observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      renderer?.destroy();
      if (rendererRef.current === renderer) rendererRef.current = null;
    };
  }, [effectiveMode]);

  useEffect(() => {
    orbitRef.current = orbit;
    zoomRef.current = zoom;
    rendererRef.current?.render(orbit, zoom);
  }, [orbit, zoom]);

  function suppressNextClick(): void {
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>): void {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const point = { x: event.clientX, y: event.clientY };
    pointersRef.current.set(event.pointerId, point);
    const gesture = gestureRef.current;
    if (gesture.primaryId === null) {
      gesture.primaryId = event.pointerId;
      gesture.startX = point.x;
      gesture.startY = point.y;
      gesture.lastX = point.x;
      gesture.lastY = point.y;
      gesture.moved = false;
      gesture.pinched = false;
    }
    if (pointersRef.current.size === 2) {
      const points = [...pointersRef.current.values()];
      gesture.pinched = true;
      gesture.moved = true;
      pinchRef.current = { distance: distance(points[0], points[1]), zoom };
    }
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>): void {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const gesture = gestureRef.current;

    if (pointersRef.current.size >= 2 && effectiveMode !== "STATIC") {
      const points = [...pointersRef.current.values()];
      const nextDistance = distance(points[0], points[1]);
      const initialDistance = pinchRef.current.distance || nextDistance;
      const ratio = initialDistance > 0 ? nextDistance / initialDistance : 1;
      setZoom(clamp(pinchRef.current.zoom * ratio, scene.zoomMin, scene.zoomMax));
      gesture.pinched = true;
      gesture.moved = true;
      return;
    }

    if (gesture.primaryId !== event.pointerId) return;
    const totalX = event.clientX - gesture.startX;
    const totalY = event.clientY - gesture.startY;
    if (Math.hypot(totalX, totalY) > 6) gesture.moved = true;

    if (scene.orbitDegrees > 0) {
      const deltaX = event.clientX - gesture.lastX;
      setOrbit((current) => clamp(current + deltaX * 0.13, -scene.orbitDegrees, scene.orbitDegrees));
    }
    gesture.lastX = event.clientX;
    gesture.lastY = event.clientY;
  }

  function resetGesture(): void {
    if (pointersRef.current.size > 0) return;
    gestureRef.current = {
      primaryId: null,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      moved: false,
      pinched: false,
    };
    pinchRef.current = { distance: 0, zoom: zoomRef.current };
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>): void {
    const gesture = gestureRef.current;
    const isPrimary = gesture.primaryId === event.pointerId;
    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    pointersRef.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }

    if (isPrimary) {
      if (!gesture.pinched && deltaY < -58 && Math.abs(deltaY) > Math.abs(deltaX) * 1.05) {
        suppressNextClick();
        onEnter();
      } else if (gesture.moved || gesture.pinched) {
        suppressNextClick();
      }
    }
    resetGesture();
  }

  function handlePointerCancel(event: PointerEvent<HTMLButtonElement>): void {
    pointersRef.current.delete(event.pointerId);
    suppressNextClick();
    resetGesture();
  }

  function handleClick(): void {
    if (suppressClickRef.current) return;
    onEnter();
  }

  function handleWheel(event: WheelEvent<HTMLButtonElement>): void {
    if (effectiveMode === "STATIC") return;
    event.preventDefault();
    const amount = event.deltaY < 0 ? 0.04 : -0.04;
    setZoom((current) => clamp(current + amount, scene.zoomMin, scene.zoomMax));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    if (effectiveMode === "STATIC") return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      setOrbit((current) => clamp(current + direction * 3, -scene.orbitDegrees, scene.orbitDegrees));
    }
  }

  return (
    <button
      type="button"
      className="stadium-interaction-surface"
      aria-label="경기장을 눌러 입장하세요"
      data-requested-mode={mode}
      data-render-mode={effectiveMode}
      data-render-state={renderState}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onWheel={handleWheel}
    >
      <span className="stadium-world" aria-hidden="true">
        <span className="stadium-sky-glow" />
        <span className="stadium-ground-glow" />
        <span className={`stadium-static-fallback ${renderState === "READY" ? "stadium-static-hidden" : ""}`}>
          <span className="stadium-static-shadow" />
          <span className="stadium-static-shell stadium-static-shell-outer" />
          <span className="stadium-static-shell stadium-static-shell-mid" />
          <span className="stadium-static-shell stadium-static-shell-inner" />
          <span className="stadium-static-pitch">
            <span className="stadium-static-halfway" />
            <span className="stadium-static-circle" />
          </span>
        </span>
        <canvas ref={canvasRef} className={`stadium-webgl-canvas ${renderState === "READY" ? "stadium-webgl-ready" : ""}`} />
        <span className="stadium-quality-chip">{scene.modeLabel}</span>
      </span>
    </button>
  );
}
