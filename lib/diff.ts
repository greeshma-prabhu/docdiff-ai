import * as Diff from 'diff';

export interface DiffResult {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface ComparisonResult {
  diffs: DiffResult[];
  additions: number;
  deletions: number;
}

export const compareText = (original: string, modified: string): ComparisonResult => {
  const diffs = Diff.diffLines(original, modified);
  
  let additions = 0;
  let deletions = 0;

  diffs.forEach((part) => {
    if (part.added) {
      additions++;
    }
    if (part.removed) {
      deletions++;
    }
  });

  return {
    diffs,
    additions,
    deletions,
  };
};

