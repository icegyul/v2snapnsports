import { describe, expect, it } from "vitest";
import { resolveRenderMode } from "../three/renderMode";

describe("stadium render fallback", () => {
  it("uses STATIC in production while final assets are unresolved", () => {
    expect(resolveRenderMode({ requested: "FULL", assetsReady: false, production: true, webgl: true, reducedMotion: false })).toBe("STATIC");
  });

  it("uses LIGHT when thermal pressure removes full quality", () => {
    expect(resolveRenderMode({ requested: "FULL", assetsReady: true, production: false, webgl: true, reducedMotion: false, thermal: "LOW" })).toBe("LIGHT");
  });
});
