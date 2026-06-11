export interface Speaker {
  id: string;
  name: string;
  bio: string;
  avatar?: string | null;
  company?: string | null;
}

export interface Track {
  id: string;
  name: string;
  color: string;
}

export interface Talk {
  id: string;
  title: string;
  abstract: string;
  tags: string[];
  trackId: string;
  track?: Track;
  speakerId: string;
  speaker?: Speaker;
  startTime: string | Date;
  endTime: string | Date;
  day: number;
}

export interface Synapse {
  id: string;
  talkAId: string;
  talkA?: Talk;
  talkBId: string;
  talkB?: Talk;
  type: string;
  strength: number;
  insight: string;
  concepts: string[];
  attendeeImplication: string;
  createdAt?: string | Date;
}

export interface User {
  id: string;
  email?: string | null;
  name?: string | null;
}

export interface Attendance {
  id: string;
  userId: string;
  talkId: string;
  talk?: Talk;
}

export interface Briefing {
  id: string;
  userId: string;
  content: {
    deeperConnections: Array<{
      talkA: string;
      talkB: string;
      reason: string;
    }>;
    whatYouMissed: Array<{
      talk: string;
      speaker: string;
      connectionToYourTalks: string;
      whyItMatters: string;
    }>;
    knowledgeGaps: Array<{
      topic: string;
      gapExplanation: string;
      recommendedAction: string;
    }>;
    recommendedRecordings: Array<{
      talkId: string;
      title: string;
      speaker: string;
      priority: 'High' | 'Medium' | 'Low';
      reason: string;
    }>;
  };
  conferenceDna: string;
  createdAt: string | Date;
}
