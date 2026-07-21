import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PageLayout } from "./PageLayout";
import { setViewportWidth } from "@/test/setup";

// Mock heavy children so the layout test stays focused on responsive branching.
vi.mock("./BottomNav", () => ({
  BottomNav: () => <nav data-testid="bottom-nav">bottom</nav>,
}));
vi.mock("./AppSidebar", () => ({
  AppSidebar: () => <aside data-testid="app-sidebar">sidebar</aside>,
}));
vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: any) => <div>{children}</div>,
  SidebarTrigger: () => <button data-testid="sidebar-trigger">trigger</button>,
}));

function renderLayout() {
  return render(
    <MemoryRouter>
      <PageLayout>
        <div data-testid="content">hello</div>
      </PageLayout>
    </MemoryRouter>
  );
}

describe("PageLayout responsive behavior", () => {
  beforeEach(() => setViewportWidth(1280));

  it("renders BottomNav on mobile (<1024)", () => {
    setViewportWidth(390);
    renderLayout();
    expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
    expect(screen.queryByTestId("app-sidebar")).not.toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("renders BottomNav on tablet (<1024)", () => {
    setViewportWidth(820);
    renderLayout();
    expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
    expect(screen.queryByTestId("app-sidebar")).not.toBeInTheDocument();
  });

  it("renders AppSidebar on desktop (>=1024)", () => {
    setViewportWidth(1440);
    renderLayout();
    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-trigger")).toBeInTheDocument();
    expect(screen.queryByTestId("bottom-nav")).not.toBeInTheDocument();
  });

  it("switches layout when viewport changes from mobile to desktop", () => {
    setViewportWidth(390);
    renderLayout();
    expect(screen.getByTestId("bottom-nav")).toBeInTheDocument();
    act(() => setViewportWidth(1440));
    expect(screen.getByTestId("app-sidebar")).toBeInTheDocument();
    expect(screen.queryByTestId("bottom-nav")).not.toBeInTheDocument();
  });
});
