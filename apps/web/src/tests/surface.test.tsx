import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Surface } from "../design-system/Surface";

describe("Graphite surface primitive", () => {
  it("uses semantic surface variants instead of component-local colors", () => {
    render(<Surface tone="elevated">Foundation content</Surface>);
    expect(screen.getByText("Foundation content").closest("section")).toHaveClass("surface", "surface-elevated");
  });
});
