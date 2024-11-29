import { SimpleHookTest } from "~/components/simpleHookTest";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { MultiHookTest } from "~/components/multiHookTest";
import { SafeMultiHookTest } from "~/components/safeMultiHookTest";

export function Welcome() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <div className="w-3/4 px-4 space-y-4">
          <SimpleHookTest />
          <MultiHookTest />
          <SafeMultiHookTest />
        </div>
      </div>
    </main>
  );
}