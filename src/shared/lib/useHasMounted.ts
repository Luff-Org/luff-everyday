import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** Returns false during SSR/hydration and true once mounted on the client, without a setState-in-effect. */
export function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
