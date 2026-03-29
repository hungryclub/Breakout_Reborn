import { evolveMetaState, INITIAL_META_STATE, type MetaState } from "./metaMath.ts";

const STORAGE_KEY = "breakout-reborn-meta";

export class MetaSystem {
  private state: MetaState = INITIAL_META_STATE;

  load(): MetaState {
    if (typeof window === "undefined") {
      return this.state;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return this.state;
    }

    try {
      this.state = {
        ...INITIAL_META_STATE,
        ...JSON.parse(raw),
      };
    } catch {
      this.state = INITIAL_META_STATE;
    }

    return this.state;
  }

  completeRun(): MetaState {
    this.state = evolveMetaState(this.state);
    this.save();
    return this.state;
  }

  getState(): MetaState {
    return this.state;
  }

  private save(): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  }
}
