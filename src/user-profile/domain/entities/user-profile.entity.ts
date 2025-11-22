export interface LearningProfile {
  level: string;
  interests: string[];
  goals: string[];
  learningStyle: string;
  motivation: string[];
  challenges: string[];
  preferredTopics: string[];
  conversationStyle: string;
  personalContext: string;
}

export class UserProfileSummary {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly profileText: string,
    public readonly learningProfile: LearningProfile,
    public readonly lastUpdated: Date,
    public readonly version: number = 1,
  ) {}
}