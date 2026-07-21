import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { setViewportWidth } from "@/test/setup";

const toggleTheme = vi.fn();
let mockTheme: "dark" | "light" = "dark";
let mockIsAdmin = false;

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ theme: mockTheme, toggleTheme }),
}));
vi.mock("@/hooks/useUserRole", () => ({
  useUserRole: () => ({ isAdmin: mockIsAdmin, isManager: false, roles: [], isLoading: false }),
}));
vi.mock("./UserMenu", () => ({ UserMenu: () => <div data-testid="user-menu" /> }));
vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: any) => <aside data-testid="sidebar">{children}</aside>,
  SidebarContent: ({ children }: any) => <div>{children}</div>,
  SidebarGroup: ({ children }: any) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: any) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: any) => <div>{children}</div>,
  SidebarMenu: ({ children }: any) => <ul>{children}</ul>,
  SidebarMenuButton: ({ children, isActive }: any) => (
    <div data-active={isActive ? "true" : "false"}>{children}</div>
  ),
  SidebarMenuItem: ({ children }: any) => <li>{children}</li>,
  SidebarHeader: ({ children }: any) => <div>{children}</div>,
  SidebarFooter: ({ children }: any) => <div>{children}</div>,
  useSidebar: () => ({ state: "expanded" }),
}));

function renderSidebar(initial = "/") {
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <AppSidebar />
    </MemoryRouter>
  );
}

describe("AppSidebar navigation", () => {
  beforeEach(() => {
    setViewportWidth(1440);
    mockTheme = "dark";
    mockIsAdmin = false;
    toggleTheme.mockClear();
  });

  it("renders base nav items on desktop (1440)", () => {
    renderSidebar();
    ["Accueil", "Voyages", "Nouveau voyage", "Calendrier", "Carte"].forEach((label) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(screen.queryByText("Administration")).not.toBeInTheDocument();
  });

  it("shows Administration only for admins", () => {
    mockIsAdmin = true;
    renderSidebar();
    expect(screen.getByText("Administration")).toBeInTheDocument();
  });

  it("marks the current route menu button as active", () => {
    renderSidebar("/voyages");
    const activeItem = screen.getByText("Voyages").closest("[data-active]")!;
    expect(activeItem.getAttribute("data-active")).toBe("true");
    const inactive = screen.getByText("Accueil").closest("[data-active]")!;
    expect(inactive.getAttribute("data-active")).toBe("false");
  });

  it("updates active state after simulated reload on a different route", () => {
    const { unmount } = renderSidebar("/calendar");
    expect(screen.getByText("Calendrier").closest("[data-active]")!.getAttribute("data-active")).toBe("true");
    unmount();
    setViewportWidth(1440);
    renderSidebar("/map");
    expect(screen.getByText("Carte").closest("[data-active]")!.getAttribute("data-active")).toBe("true");
    expect(screen.getByText("Calendrier").closest("[data-active]")!.getAttribute("data-active")).toBe("false");
  });

  it("toggles theme when the theme button is clicked", () => {
    renderSidebar();
    fireEvent.click(screen.getByText("Mode clair"));
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});
