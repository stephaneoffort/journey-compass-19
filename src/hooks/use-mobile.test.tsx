import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "./use-mobile";
import { setViewportWidth } from "@/test/setup";

describe("useIsMobile", () => {
  beforeEach(() => setViewportWidth(1280));

  it("returns false on desktop widths (>=768)", () => {
    setViewportWidth(1440);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true on mobile widths (<768)", () => {
    setViewportWidth(390);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false at the tablet breakpoint (768)", () => {
    setViewportWidth(768);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("reacts to viewport changes", () => {
    setViewportWidth(1440);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
    act(() => setViewportWidth(375));
    expect(result.current).toBe(true);
  });
});
