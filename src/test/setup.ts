import "@testing-library/jest-dom";

// matchMedia mock that evaluates min/max-width queries against window.innerWidth.
// Tracks every created MQL so setViewportWidth() can notify listeners on resize.
const activeMqls = new Set<{ query: string; listeners: Set<any>; prev: boolean }>();

function evaluateQuery(query: string) {
  const width = window.innerWidth;
  const min = query.match(/\(min-width:\s*(\d+)px\)/);
  const max = query.match(/\(max-width:\s*(\d+)px\)/);
  let matches = true;
  if (min) matches = matches && width >= parseInt(min[1], 10);
  if (max) matches = matches && width <= parseInt(max[1], 10);
  return matches;
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => {
    const entry = { query, listeners: new Set<any>(), prev: evaluateQuery(query) };
    activeMqls.add(entry);
    return {
      get matches() {
        return evaluateQuery(query);
      },
      media: query,
      onchange: null,
      addListener: (cb: any) => entry.listeners.add(cb),
      removeListener: (cb: any) => entry.listeners.delete(cb),
      addEventListener: (_: string, cb: any) => entry.listeners.add(cb),
      removeEventListener: (_: string, cb: any) => entry.listeners.delete(cb),
      dispatchEvent: () => true,
    } as unknown as MediaQueryList;
  },
});

// Helper exposed to tests to change the viewport width and notify MQL listeners.
export function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
  activeMqls.forEach((entry) => {
    const next = evaluateQuery(entry.query);
    if (next !== entry.prev) {
      entry.prev = next;
      entry.listeners.forEach((cb) => cb({ matches: next, media: entry.query }));
    }
  });
}
