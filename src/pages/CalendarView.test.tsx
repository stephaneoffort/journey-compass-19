import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CalendarView from "./CalendarView";
import { setViewportWidth } from "@/test/setup";

// Fix "today" so a known day always exists in the rendered month.
const FIXED_NOW = new Date(2026, 6, 15); // July 2026
vi.setSystemTime(FIXED_NOW);

const mockTrips = [
  {
    id: "t1",
    transportType: "train",
    departureDate: "2026-07-10",
    departureCity: "Paris",
    departureCountry: "FR",
    arrivalCity: "Lyon",
    arrivalCountry: "FR",
    via: [],
    status: "planned",
  },
  {
    id: "t2",
    transportType: "plane",
    departureDate: "2026-07-10",
    departureCity: "Lyon",
    departureCountry: "FR",
    arrivalCity: "Rome",
    arrivalCountry: "IT",
    via: [],
    status: "planned",
  },
];

vi.mock("@/hooks/useTrips", () => ({
  useTrips: () => ({ data: mockTrips, isLoading: false }),
}));
vi.mock("@/components/layout/PageLayout", () => ({
  PageLayout: ({ children }: any) => <div>{children}</div>,
}));

function renderCalendar() {
  return render(
    <MemoryRouter>
      <CalendarView />
    </MemoryRouter>
  );
}

describe("CalendarView day dots", () => {
  beforeEach(() => setViewportWidth(1440));

  it.each([390, 768, 1440])("renders trip dots on the 10th at %ipx", (w) => {
    setViewportWidth(w);
    const { container } = renderCalendar();
    const dayButton = screen.getByRole("button", { name: /^10$/ });
    const dots = dayButton.querySelectorAll("span.rounded-full");
    expect(dots.length).toBe(2);
  });

  it("opens the details dialog when a day with trips is clicked", () => {
    renderCalendar();
    fireEvent.click(screen.getByRole("button", { name: /^10$/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/Paris/)).toBeInTheDocument();
    expect(within(dialog).getByText(/Rome/)).toBeInTheDocument();
  });
});
