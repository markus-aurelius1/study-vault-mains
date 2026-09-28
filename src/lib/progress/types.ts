export type RecallRating = 'again' | 'hard' | 'good' | 'easy';
export type RecallLevel = 'weak' | 'functional' | 'strong';
export type ApplicationLevel = 'unpractised' | 'outlined' | 'timed' | 'stable';
export type StudyStage = 'not-started' | 'learning' | 'recall-ready' | 'applied' | 'stable';

export interface TopicStudyState {
  topicId: string;
  firstStudiedAt: number | null;
  lastOpenedAt: number | null;
  studyStage: StudyStage;
  recallLevel: RecallLevel;
  applicationLevel: ApplicationLevel;
  lastRecallAt: number | null;
  lastPracticeAt: number | null;
  preferredMode: 'answer-kit' | 'recall' | 'practice' | 'deep';
  pinned: boolean;
}

export interface RecallPromptState {
  promptId: string;
  topicId: string;
  stage: number;
  lastReviewedAt: number | null;
  dueAt: number | null;
  lastRating: RecallRating | null;
  successes: number;
  successfulDays: number[];
  lapses: number;
}

export interface AnswerAttempt {
  id: string;
  pyqId: string;
  startedAt: number;
  completedAt: number | null;
  type: 'outline' | 'timed' | 'full';
  seconds: number;
  topicIds: string[];
  demandIds: string[];
  rubric: Record<string, 0 | 1 | 2>;
  weaknessEventIds: string[];
  reattemptDueAt: number | null;
}

export interface WeaknessEvent {
  id: string;
  weaknessId: string;
  kind: 'observed' | 'demonstrated';
  sourceType: 'practice' | 'recall' | 'manual';
  sourceId: string;
  targetType: 'topic' | 'demand' | 'argument' | 'evidence' | 'visual' | 'skill';
  targetId: string;
  severity: 1 | 2 | 3;
  observedAt: number;
}

export interface RecentTopic { topicId: string; at: number }

export interface Snapshot {
  version: number;
  topicStates: Record<string, TopicStudyState>;
  promptStates: Record<string, RecallPromptState>;
  attempts: Record<string, AnswerAttempt>;
  weaknessEvents: WeaknessEvent[];
  recentTopics: RecentTopic[];
}

export interface StorageAdapter {
  read(): Snapshot | null;
  write(snapshot: Snapshot): void;
}
