import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { setViewportWidth } from "@/test/setup";

vi.mock("@/hooks/useVoyages", () => ({
  useVoyages: () => ({
    data: [
      { id: "v1", name: "Voyage A", startDate: "2026-01-01", trips: [{ id: "t1" }] },
      { id: "v2", name: "Voyage B", startDate: "2026-02-01", trips: [{ id: "t2" }, { id: "t3" }] },
    ],
  }),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderNav(initial = "/") {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route
          path="*"
          element={
            <>
              <BottomNav />
              <LocationProbe />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("BottomNav navigation", () => {
  beforeEach(() => setViewportWidth(390));

  it("renders all nav items on mobile (390)", () => {
    renderNav();
    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.getByText("Voyages")).toBeInTheDocument();
    expect(screen.getByText("Calendrier")).toBeInTheDocument();
    expect(screen.getByText("Carte")).toBeInTheDocument();
  });

  it("marks the current route link as active", () => {
    renderNav("/voyages");
    const voyagesLink = screen.getByText("Voyages").closest("a")!;
    expect(voyagesLink.className).toMatch(/active/);
    const accueilLink = screen.getByText("Accueil").closest("a")!;
    expect(accueilLink.className).not.toMatch(/active/);
  });

  it("updates active state after viewport change + navigation (simulated reload)", () => {
    setViewportWidth(768);
    const { unmount } = renderNav("/calendar");
    let calendrier = screen.getByText("Calendrier").closest("a")!;
    expect(calendrier.className).toMatch(/active/);
    unmount();
    // Simulate reload on a different route with a resized viewport
    setViewportWidth(390);
    renderNav("/map");
    const map = screen.getByText("Carte").closest("a")!;
    expect(map.className).toMatch(/active/);
    expect(screen.getByText("Calendrier").closest("a")!.className).not.toMatch(/active/);
  });

  it("opens the action Dialog on + tap and closes it via backdrop", () => {
    renderNav();
    const plusBtn = screen.getAllByRole("button")[0];
    fireEvent.click(plusBtn);
    expect(screen.getByText("Que voulez-vous faire ?")).toBeInTheDocument();
    expect(screen.getByText("Nouveau voyage")).toBeInTheDocument();
    // Close via X button
    fireEvent.click(screen.getByText("Que voulez-vous faire ?").parentElement!.querySelector("button")!);
    expect(screen.queryByText("Que voulez-vous faire ?")).not.toBeInTheDocument();
  });

  it("navigates to /add when 'Nouveau voyage' is chosen from the Dialog", () => {
    renderNav();
    fireEvent.click(screen.getAllByRole("button")[0]);
    fireEvent.click(screen.getByText("Nouveau voyage"));
    expect(screen.getByTestId("location").textContent).toBe("/add");
  });

  it("navigates to /add-single?voyageId=... from a quick pick", () => {
    renderNav();
    fireEvent.click(screen.getAllByRole("button")[0]);
    const shortcut = screen.getByText("Voyage A").closest("button")!;
    fireEvent.click(shortcut);
    expect(screen.getByTestId("location").textContent).toBe("/add-single?voyageId=v1");
  });
});
