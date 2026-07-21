import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TransportFilter } from "./TransportFilter";
import { setViewportWidth } from "@/test/setup";

function renderAt(width: number) {
  setViewportWidth(width);
  const onChange = vi.fn();
  render(<TransportFilter selected="all" onChange={onChange} />);
  return { onChange };
}

describe("TransportFilter across breakpoints", () => {
  beforeEach(() => setViewportWidth(1440));

  it.each([390, 768, 1440])("renders all transport buttons at %ipx", (w) => {
    renderAt(w);
    // 7 buttons: all + 6 transports
    expect(screen.getAllByRole("button")).toHaveLength(7);
    expect(screen.getByText("Tous")).toBeInTheDocument();
  });

  it("calls onChange when a filter is clicked", () => {
    const { onChange } = renderAt(390);
    fireEvent.click(screen.getAllByRole("button")[1]);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("marks the selected filter with ring styling", () => {
    setViewportWidth(768);
    render(<TransportFilter selected="train" onChange={() => {}} />);
    const trainBtn = screen.getAllByRole("button").find((b) => b.textContent?.includes("Train"))!;
    expect(trainBtn.className).toMatch(/ring-2/);
  });
});
