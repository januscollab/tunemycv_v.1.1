
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CompatibilityBreakdown {
  technicalSkills?: { score: number };
  experience?: { score: number };
  education?: { score: number };
  softSkills?: { score: number };
  industryKnowledge?: { score: number };
}

export const useScoreValidation = () => {
  const { toast } = useToast();

  const validateAndCorrectScore = async (analysisResult: any, userId: string) => {
    const { compatibilityScore, compatibilityBreakdown } = analysisResult;
    
    if (!compatibilityBreakdown) return analysisResult;

    // Calculate average from breakdown scores
    const breakdown = compatibilityBreakdown as CompatibilityBreakdown;
    const scores = [
      breakdown.technicalSkills?.score,
      breakdown.experience?.score,
      breakdown.education?.score,
      breakdown.softSkills?.score,
      breakdown.industryKnowledge?.score
    ].filter(score => score !== undefined && score !== null) as number[];

    if (scores.length === 0) return analysisResult;

    const calculatedAverage = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const scoreDifference = Math.abs(compatibilityScore - calculatedAverage);

    // Flag significant discrepancies (>20 points difference or 0% overall score with valid breakdowns)
    const isAnomalous = scoreDifference > 20 || (compatibilityScore === 0 && calculatedAverage > 0);

    if (isAnomalous) {
      console.warn('Score anomaly detected:', {
        originalScore: compatibilityScore,
        calculatedAverage,
        difference: scoreDifference,
        userId,
        analysisId: analysisResult.id
      });

      // Alert admin about anomaly
      try {
        await supabase.functions.invoke('alert-admin-anomaly', {
          body: {
            type: 'score_anomaly',
            originalScore: compatibilityScore,
            calculatedScore: calculatedAverage,
            difference: scoreDifference,
            userId,
            analysisId: analysisResult.id || 'unknown',
            timestamp: new Date().toISOString()
          }
        });
      } catch (error) {
        console.error('Failed to alert admin:', error);
      }

      // Use fallback scoring
      const correctedResult = {
        ...analysisResult,
        compatibilityScore: calculatedAverage,
        scoreMethod: 'fallback_calculated'
      };

      toast({
        title: 'Score Adjusted',
        description: `Compatibility score was adjusted from ${compatibilityScore}% to ${calculatedAverage}% based on detailed analysis.`,
        variant: 'default'
      });

      return correctedResult;
    }

    return analysisResult;
  };

  return { validateAndCorrectScore };
};
