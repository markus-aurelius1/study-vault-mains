import type { ArgumentSource, EvidenceAsset, FrameworkAsset, PaperId, ThinkerAsset, TopicSource, VisualAsset } from './schema';

export type PyqIndexRow = [string, string, string, string, string, string, number, number];

export interface CanonicalArgument extends ArgumentSource {
  canonicalId: string;
  originTopicId: string;
  localRef: string;
  imported: boolean;
}

export interface CompiledPyq {
  id: string;
  role: 'primary' | 'secondary' | 'contextual';
  demand_refs: string[];
  text: string;
  paper: string;
  subject: string;
  topic: string;
  href: string;
  year: number;
  marks: number;
}

export interface CompiledTopic extends Omit<TopicSource, 'arguments' | 'pyqs'> {
  arguments: CanonicalArgument[];
  pyqs: CompiledPyq[];
  resolved: {
    evidence: EvidenceAsset[];
    thinkers: ThinkerAsset[];
    visuals: VisualAsset[];
    frameworks: FrameworkAsset[];
  };
}

export interface TopicSummary {
  id: string;
  title: string;
  paper: PaperId;
  node_type: 'core' | 'synthesis';
  syllabus: string;
  pyqCount: number;
  demandCount: number;
  href: string;
}

export interface ContentManifest {
  schemaVersion: 'mains-topic-v1';
  digest: string;
  papers: Array<{ id: PaperId; label: string; topics: TopicSummary[] }>;
  topics: TopicSummary[];
}
