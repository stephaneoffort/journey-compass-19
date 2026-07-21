import "@testing-library/jest-dom";

// matchMedia mock that evaluates min/max-width queries against window.innerWidth
function createMatchMedia(query: string): MediaQueryList {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();

  const evaluate = () => {
    const width = window.innerWidth;
    const min = query.match(/\(min-width:\s*(\d+)px\)/);
    const max = query.match(/\(max-width:\s*(\d+)px\)/);
    let matches = true;
    if (min) matches = matches && width >= parseInt(min[1], 10);
    if (max) matches = matches && width <= parseInt(max[1], 10);
    return matches;
  };

  const mql = {
    get matches() {
      return evaluate();
    },
    media: query,
    onchange: null,
    addListener: (cb: any) => listeners.add(cb),
    removeListener: (cb: any) => listeners.delete(cb),
    addEventListener: (_: string, cb: any) => listeners.add(cb),
    removeEventListener: (_: string, cb: any) => listeners.delete(cb),
    dispatchEvent: (evt: Event) => {
      listeners.forEach((cb) => cb(evt as MediaQueryListEvent));
      return true;
    },
  } as unknown as MediaQueryList;

  return mql;
}

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => createMatchMedia(query),
});

// Helper exposed to tests to change the viewport width and notify listeners.
export function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
  // Fire a change event that our matchMedia mocks listen for
  window.dispatchEvent(new Event("change"));
}
