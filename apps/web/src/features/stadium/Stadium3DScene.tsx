import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import type { CoreVisualMode } from "../../api/coreProductContracts";
import { createStadiumScene, nextStadiumMode } from "../../three/stadiumScene";
import { createStadiumWebglRenderer, type StadiumWebglRenderer } from "../../three/stadiumWebgl";
import { getStadiumHomeMotionProfile } from "./stadiumHomeMotion";

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
  const surfaceRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<StadiumWebglRenderer | null>(null);
  const introAnimationRef = useRef<{ cancel(): void } | null>(null);
  const [effectiveMode, setEffectiveMode] = useState<CoreVisualMode>(mode);
  const [renderState, setRenderState] = useState<RenderState>(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
  const [orbit, setOrbit] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rise, setRise] = useState(0);
  const orbitRef = useRef(orbit);
  const zoomRef = useRef(zoom);
  const riseRef = useRef(rise);
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

  const cancelIntroCamera = useCallback((syncReactState: boolean) => {
    if (!introAnimationRef.current) return;
    introAnimationRef.current.cancel();
    introAnimationRef.current = null;
    if (syncReactState) {
      setOrbit(orbitRef.current);
      setZoom(zoomRef.current);
    }
  }, []);

  useEffect(() => {
    cancelIntroCamera(false);
    setEffectiveMode(mode);
    setRenderState(mode === "STATIC" ? "FALLBACK" : "INITIALIZING");
    orbitRef.current = 0;
    zoomRef.current = 1;
    riseRef.current = 0;
    setOrbit(0);
    setZoom(1);
    setRise(0);
  }, [cancelIntroCamera, mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    rendererRef.current?.destroy();
    rendererRef.current = null;
    cancelIntroCamera(false);

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

    const reducedMotion = typeof window.matchMedia === "function"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cameraMotion = getStadiumHomeMotionProfile(reducedMotion).camera;
    if (cameraMotion.enabled) {
      orbitRef.current = cameraMotion.fromOrbit;
      zoomRef.current = cameraMotion.fromZoom;
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      renderer?.resize(rect.width, rect.height, window.devicePixelRatio || 1);
      renderer?.render(orbitRef.current, zoomRef.current, riseRef.current);
    };
    resize();

    let introLoadCancelled = false;
    if (cameraMotion.enabled) {
      void import("animejs").then(({ animate }) => {
        if (introLoadCancelled || rendererRef.current !== renderer) return;
        const cameraState = {
          orbit: cameraMotion.fromOrbit,
          zoom: cameraMotion.fromZoom,
        };
        introAnimationRef.current = animate(cameraState, {
          orbit: cameraMotion.toOrbit,
          zoom: cameraMotion.toZoom,
          duration: cameraMotion.duration,
          ease: "out(3)",
          onUpdate: () => {
            if (rendererRef.current !== renderer) return;
            orbitRef.current = cameraState.orbit;
            zoomRef.current = cameraState.zoom;
            renderer.render(cameraState.orbit, cameraState.zoom, riseRef.current);
          },
          onComplete: () => {
            if (rendererRef.current !== renderer) return;
            introAnimationRef.current = null;
            orbitRef.current = cameraMotion.toOrbit;
            zoomRef.current = cameraMotion.toZoom;
            setOrbit(cameraMotion.toOrbit);
            setZoom(cameraMotion.toZoom);
          },
        });
      });
    }

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      introLoadCancelled = true;
      cancelIntroCamera(false);
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
      introLoadCancelled = true;
      cancelIntroCamera(false);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
      renderer?.destroy();
      if (rendererRef.current === renderer) rendererRef.current = null;
    };
  }, [cancelIntroCamera, effectiveMode]);

  useEffect(() => {
    orbitRef.current = orbit;
    zoomRef.current = zoom;
    riseRef.current = rise;
    rendererRef.current?.render(orbit, zoom, rise);
  }, [orbit, zoom, rise]);

  function suppressNextClick(): void {
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>): void {
    cancelIntroCamera(true);
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Inactive pointer (synthetic events, or a pointer lost mid-gesture).
      // Gesture tracking below must keep working without capture.
    }
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

    if (pointersRef.current.size >= 2) {
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
    if (effectiveMode !== "STATIC") {
      // Upward drag lifts the camera toward the aerial pitch view.
      const deltaY = event.clientY - gesture.lastY;
      setRise((current) => clamp(current - deltaY * 0.0035, 0, 1));
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
    pointersRef.current.delete(event.pointerId);
    try {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture?.(event.pointerId);
      }
    } catch {
      // Releasing an already-lost pointer must not break gesture cleanup.
    }

    // Vertical drags are camera control (rise), so entry happens only on a
    // clean click — any moved or pinched gesture suppresses it.
    if (isPrimary && (gesture.moved || gesture.pinched)) {
      suppressNextClick();
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

  const wheelHandlerRef = useRef<(event: globalThis.WheelEvent) => void>(() => {});
  wheelHandlerRef.current = (event: globalThis.WheelEvent) => {
    cancelIntroCamera(true);
    event.preventDefault();
    const amount = event.deltaY < 0 ? 0.04 : -0.04;
    setZoom((current) => clamp(current + amount, scene.zoomMin, scene.zoomMax));
  };

  useEffect(() => {
    // React root wheel listeners are passive, so preventDefault there logs a
    // console error. Zoom needs to stop page scroll, so bind non-passively.
    const surface = surfaceRef.current;
    if (!surface) return;
    const handler = (event: globalThis.WheelEvent) => wheelHandlerRef.current(event);
    surface.addEventListener("wheel", handler, { passive: false });
    return () => surface.removeEventListener("wheel", handler);
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    if (event.key === "+" || event.key === "=") {
      cancelIntroCamera(true);
      event.preventDefault();
      setZoom((current) => clamp(current + 0.08, scene.zoomMin, scene.zoomMax));
      return;
    }
    if (event.key === "-" || event.key === "_") {
      cancelIntroCamera(true);
      event.preventDefault();
      setZoom((current) => clamp(current - 0.08, scene.zoomMin, scene.zoomMax));
      return;
    }
    if (event.key === "0") {
      cancelIntroCamera(true);
      event.preventDefault();
      setZoom(clamp(1, scene.zoomMin, scene.zoomMax));
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (effectiveMode === "STATIC") return;
      cancelIntroCamera(true);
      event.preventDefault();
      const direction = event.key === "ArrowUp" ? 1 : -1;
      setRise((current) => clamp(current + direction * 0.12, 0, 1));
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      if (scene.orbitDegrees <= 0) return;
      cancelIntroCamera(true);
      event.preventDefault();
      const direction = event.key === "ArrowLeft" ? -1 : 1;
      setOrbit((current) => clamp(current + direction * 3, -scene.orbitDegrees, scene.orbitDegrees));
    }
  }

  return (
    <button
      ref={surfaceRef}
      type="button"
      className="stadium-interaction-surface"
      aria-label="경기장 입장"
      data-requested-mode={mode}
      data-render-mode={effectiveMode}
      data-render-state={renderState}
      data-zoom={zoom.toFixed(3)}
      data-rise={rise.toFixed(3)}
      style={{ "--stadium-zoom": zoom } as CSSProperties}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
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
