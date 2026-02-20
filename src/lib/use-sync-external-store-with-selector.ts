/**
 * ESM-compatible implementation of useSyncExternalStoreWithSelector.
 *
 * This shim exists because @tanstack/react-store imports the CJS-only
 * `use-sync-external-store/shim/with-selector.js`, which Vite cannot serve
 * as ESM in the browser environment when running under TanStack Start +
 * Cloudflare plugin (where optimizeDeps pre-bundling is bypassed).
 *
 * This implementation mirrors the React source:
 * https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreWithSelector.js
 */
import {
  useDebugValue,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";

type Subscribe = (onStoreChange: () => void) => () => void;

export function useSyncExternalStoreWithSelector<Snapshot, Selection>(
  subscribe: Subscribe,
  getSnapshot: () => Snapshot,
  getServerSnapshot: (() => Snapshot) | undefined,
  selector: (snapshot: Snapshot) => Selection,
  isEqual?: (a: Selection, b: Selection) => boolean,
): Selection {
  // Tracks the last committed selection value for continuity across re-memos.
  // Only written in useEffect (commit phase), so safe to read during render.
  const instRef = useRef<{ hasValue: boolean; value: Selection | null }>({
    hasValue: false,
    value: null,
  });

  const [getSelection, getServerSelection] = useMemo(() => {
    // Closure-local memoization variables (safe to mutate during render).
    let hasMemo = false;
    let memoizedSnapshot: Snapshot;
    let memoizedSelection: Selection;

    const memoizedSelector = (nextSnapshot: Snapshot): Selection => {
      if (!hasMemo) {
        hasMemo = true;
        memoizedSnapshot = nextSnapshot;
        const nextSelection = selector(nextSnapshot);
        // If the derived selection is equal to the previous committed value,
        // reuse the old reference to preserve referential stability.
        if (isEqual !== undefined && instRef.current.hasValue) {
          const prev = instRef.current.value as Selection;
          if (isEqual(prev, nextSelection)) {
            memoizedSelection = prev;
            return prev;
          }
        }
        memoizedSelection = nextSelection;
        return nextSelection;
      }

      if (Object.is(memoizedSnapshot, nextSnapshot)) {
        return memoizedSelection;
      }

      const nextSelection = selector(nextSnapshot);
      if (isEqual !== undefined && isEqual(memoizedSelection, nextSelection)) {
        memoizedSnapshot = nextSnapshot;
        return memoizedSelection;
      }

      memoizedSnapshot = nextSnapshot;
      memoizedSelection = nextSelection;
      return nextSelection;
    };

    return [
      () => memoizedSelector(getSnapshot()),
      getServerSnapshot !== undefined
        ? () => memoizedSelector(getServerSnapshot())
        : undefined,
    ] as const;
  }, [getSnapshot, getServerSnapshot, selector, isEqual]);

  const value = useSyncExternalStore(
    subscribe,
    getSelection,
    getServerSelection,
  );

  useEffect(() => {
    instRef.current.hasValue = true;
    instRef.current.value = value;
  }, [value]);

  useDebugValue(value);
  return value;
}
