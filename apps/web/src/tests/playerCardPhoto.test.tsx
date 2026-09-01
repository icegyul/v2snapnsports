import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MyPlayerCardPage } from "../features/player/MyPlayerCardPage";
import { PLAYER_PHOTO_STORAGE_KEY } from "../features/player/playerPhotoStorage";

const prepared = vi.hoisted(() => ({
  result: { status: "READY", dataUrl: `data:image/jpeg;base64,${"A".repeat(48)}` } as
    | { status: "READY"; dataUrl: string }
    | { status: "UNSUPPORTED_TYPE" }
    | { status: "TOO_LARGE" }
    | { status: "UNREADABLE" },
}));

vi.mock("../features/player/preparePlayerPhoto", () => ({
  preparePlayerPhoto: vi.fn(async () => prepared.result),
}));

async function renderPage() {
  render(
    <MemoryRouter>
      <MyPlayerCardPage />
    </MemoryRouter>,
  );
  return await screen.findByLabelText("내 선수 카드");
}

function pickFile(name = "me.jpg", type = "image/jpeg") {
  const input = screen.getByLabelText("카드 사진 올리기") as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(["x"], name, { type })] } });
  return input;
}

describe("card photo", () => {
  beforeEach(() => {
    window.localStorage.clear();
    prepared.result = { status: "READY", dataUrl: `data:image/jpeg;base64,${"A".repeat(48)}` };
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
    });
  });

  afterEach(() => cleanup());

  it("offers a photo control and starts with the silhouette", async () => {
    const card = await renderPage();
    expect(screen.getByLabelText("카드 사진 올리기")).toBeInTheDocument();
    expect(card.querySelector(".player-card-silhouette")).not.toBeNull();
    expect(card.querySelector(".player-card-photo")).toBeNull();
  });

  it("puts a chosen photo on the card and keeps it", async () => {
    const card = await renderPage();
    pickFile();

    await waitFor(() => expect(card.querySelector(".player-card-photo")).not.toBeNull());
    expect(card.querySelector(".player-card-silhouette")).toBeNull();
    expect(window.localStorage.getItem(PLAYER_PHOTO_STORAGE_KEY)).toContain("data:image/jpeg;base64,");
  });

  it("shows a stored photo again on the next visit", async () => {
    window.localStorage.setItem(PLAYER_PHOTO_STORAGE_KEY, `data:image/jpeg;base64,${"B".repeat(48)}`);
    const card = await renderPage();
    expect(card.querySelector(".player-card-photo")).not.toBeNull();
  });

  it("removes the photo and falls back to the silhouette", async () => {
    const card = await renderPage();
    pickFile();
    await waitFor(() => expect(card.querySelector(".player-card-photo")).not.toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "사진 삭제" }));

    await waitFor(() => expect(card.querySelector(".player-card-photo")).toBeNull());
    expect(card.querySelector(".player-card-silhouette")).not.toBeNull();
    expect(window.localStorage.getItem(PLAYER_PHOTO_STORAGE_KEY)).toBeNull();
  });

  it("explains a rejected file instead of failing silently", async () => {
    await renderPage();
    prepared.result = { status: "UNSUPPORTED_TYPE" };
    pickFile("notes.pdf", "application/pdf");

    expect(await screen.findByRole("status")).toHaveTextContent(/사진 형식/);
  });

  it("says so when the photo is too large even after shrinking", async () => {
    await renderPage();
    prepared.result = { status: "TOO_LARGE" };
    pickFile();

    expect(await screen.findByRole("status")).toHaveTextContent(/용량/);
  });

  it("tells the player the photo stays on this device", async () => {
    await renderPage();
    expect(screen.getByText(/이 기기에만 저장/)).toBeInTheDocument();
  });
});
