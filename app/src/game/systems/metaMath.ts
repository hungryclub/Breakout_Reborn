export interface MetaState {
  runsCompleted: number;
  startingChoiceCount: number;
}

export const INITIAL_META_STATE: MetaState = {
  runsCompleted: 0,
  startingChoiceCount: 2,
};

export function evolveMetaState(state: MetaState): MetaState {
  const runsCompleted = state.runsCompleted + 1;
  const startingChoiceCount = runsCompleted >= 3 ? 3 : 2;

  return {
    runsCompleted,
    startingChoiceCount,
  };
}
