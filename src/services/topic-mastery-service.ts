import { createClient } from '@/utils/supabase/client';
import { ENDPOINTS } from '@/config/urls';

export interface MasteryQuestion {
  question_id: string;
  question: string;
  user_answer: string;
  user_answer_text?: string;
  correct_answer: string;
  is_correct: boolean;
  explanation?: string;
  notes?: string;
  choices?: Record<string, string>;
  confidence_level: number;
  question_type: string;
}

export interface TopicSubmission {
  _id: string;
  user_id: string;
  topic_id: string;
  accuracy_rate: number;
  confidence_score: number;
  last_interaction: string;
  mastery_score: number;
  question_exposure_count: number;
  recency_weight: number;
  questions: MasteryQuestion[];
}

export interface TopicSection {
  section_title: string;
  submissions: TopicSubmission[];
}

export interface StudyGuideMastery {
  study_guide_title: string;
  study_guide_id: string;
  sections: TopicSection[];
}

export interface TopicMasteryData {
  study_guides: StudyGuideMastery[];
}

export interface TopicMasteryResponse {
  message: string;
  mastery_data: TopicMasteryData | null;
}

export interface UpdateTopicMasteryRequest {
  user_id: string;
  study_guide_id: string;
  section_id: string;
  questions: MasteryQuestion[];
}

/**
 * Fetches topic mastery data for a user, optionally filtered by study guide
 * @param userId - The user ID
 * @param studyGuideId - Optional study guide ID to filter by
 * @returns Promise with topic mastery data
 */
export async function getUserTopicMastery(
  userId: string,
  studyGuideId?: string
): Promise<TopicMasteryResponse> {
  try {
    const supabase = createClient();
    const token = await supabase.auth
      .getSession()
      .then((res) => res.data.session?.access_token);

    if (!token) {
      throw new Error('Not authenticated');
    }

    const endpoint = studyGuideId
      ? ENDPOINTS.topicMastery(userId, studyGuideId)
      : ENDPOINTS.topicMastery(userId);

    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch mastery data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching topic mastery data:', error);
    throw error;
  }
}

/**
 * Fetches mastery data for a specific topic within a study guide
 * @param userId - The user ID
 * @param studyGuideId - The study guide ID
 * @param topicId - The topic ID
 * @returns Promise with topic-specific mastery data
 */
export async function getUserTopicSpecificMastery(
  userId: string,
  studyGuideId: string,
  topicId: string
): Promise<TopicMasteryResponse> {
  try {
    const supabase = createClient();
    const token = await supabase.auth
      .getSession()
      .then((res) => res.data.session?.access_token);

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      ENDPOINTS.topicSpecificMastery(userId, studyGuideId, topicId),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch specific topic mastery data: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching specific topic mastery data:', error);
    throw error;
  }
}

/**
 * Updates mastery data based on a test submission
 * @param updateData - The data to update with
 * @returns Promise with updated mastery data
 */
export async function updateTopicMastery(
  updateData: UpdateTopicMasteryRequest
): Promise<TopicMasteryResponse> {
  try {
    const supabase = createClient();
    const token = await supabase.auth
      .getSession()
      .then((res) => res.data.session?.access_token);

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(ENDPOINTS.updateTopicMastery, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update mastery data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating topic mastery data:', error);
    throw error;
  }
}

/**
 * Gets an overall summary of all mastery data for a user
 * @param userId - The user ID
 * @returns Promise with summarized mastery data
 */
export async function getUserMasterySummary(userId: string): Promise<{
  overall_mastery: number;
  total_questions: number;
  study_guides_progress: Array<{
    study_guide_id: string;
    study_guide_title: string;
    mastery_score: number;
    sections_count: number;
  }>;
}> {
  try {
    const masteryData = await getUserTopicMastery(userId);

    if (!masteryData.mastery_data?.study_guides?.length) {
      return {
        overall_mastery: 0,
        total_questions: 0,
        study_guides_progress: [],
      };
    }

    // Calculate overall stats
    let totalMasterySum = 0;
    let totalGuides = 0;
    let totalQuestions = 0;

    const study_guides_progress = masteryData.mastery_data.study_guides.map(
      (guide) => {
        let guideQuestions = 0;
        let guideMasterySum = 0;
        let sectionsWithData = 0;

        guide.sections.forEach((section) => {
          if (section.submissions && section.submissions.length > 0) {
            const latestSubmission = [...section.submissions].sort(
              (a, b) =>
                new Date(b.last_interaction).getTime() -
                new Date(a.last_interaction).getTime()
            )[0];

            guideMasterySum += latestSubmission.mastery_score;
            guideQuestions += latestSubmission.question_exposure_count;
            sectionsWithData++;
          }
        });

        const guideMastery =
          sectionsWithData > 0 ? guideMasterySum / sectionsWithData : 0;

        totalMasterySum += guideMastery;
        totalGuides += sectionsWithData > 0 ? 1 : 0;
        totalQuestions += guideQuestions;

        return {
          study_guide_id: guide.study_guide_id,
          study_guide_title: guide.study_guide_title,
          mastery_score: Math.round(guideMastery),
          sections_count: guide.sections.length,
        };
      }
    );

    return {
      overall_mastery:
        totalGuides > 0 ? Math.round(totalMasterySum / totalGuides) : 0,
      total_questions: totalQuestions,
      study_guides_progress,
    };
  } catch (error) {
    console.error('Error calculating mastery summary:', error);
    return {
      overall_mastery: 0,
      total_questions: 0,
      study_guides_progress: [],
    };
  }
}
