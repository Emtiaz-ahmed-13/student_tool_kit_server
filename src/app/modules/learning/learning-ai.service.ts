import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../../../config";
import {
  Difficulty,
  IAINotesValidation,
  IAIStudyAnalysis,
  IAITopicExtraction,
} from "./learning.types";

class LearningAIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini_api_key as string);
  }

  // Extract topics and analyze reading materials
  async extractTopicsFromContent(
    content: string,
    title: string
  ): Promise<IAITopicExtraction> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `
        Analyze the following educational content and extract:
        1. Main topics and subtopics (as a comma-separated list)
        2. Key points and important concepts (as a comma-separated list)
        3. Difficulty level (EASY, MEDIUM, or HARD)
        4. Estimated reading time in minutes
        5. Brief summary (2-3 sentences)

        Title: ${title}
        Content: ${content.substring(0, 8000)} // Limit content for API

        Please respond in the following JSON format:
        {
          "topics": ["topic1", "topic2", "topic3"],
          "keyPoints": ["point1", "point2", "point3"],
          "difficulty": "EASY|MEDIUM|HARD",
          "estimatedReadTime": number,
          "summary": "Brief summary of the content"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid AI response format");
      }

      const analysisResult = JSON.parse(jsonMatch[0]);

      return {
        topics: analysisResult.topics || [],
        keyPoints: analysisResult.keyPoints || [],
        difficulty: this.validateDifficulty(analysisResult.difficulty),
        estimatedReadTime: Math.max(1, analysisResult.estimatedReadTime || 5),
        summary: analysisResult.summary || "No summary available",
      };
    } catch (error) {
      console.error("Error in AI topic extraction:", error);

      // Fallback analysis
      return {
        topics: this.extractTopicsFallback(content),
        keyPoints: this.extractKeyPointsFallback(content),
        difficulty: this.assessDifficultyFallback(content),
        estimatedReadTime: Math.ceil(content.length / 200), // ~200 words per minute
        summary: "AI analysis failed. Basic extraction performed.",
      };
    }
  }

  // Analyze study session and generate report
  async analyzeStudySession(sessionData: {
    duration: number;
    subjectName?: string;
    materialsCovered?: string[];
    notesContent?: string;
    focusInterruptions?: number;
  }): Promise<IAIStudyAnalysis> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `
        Analyze this study session and provide detailed feedback:

        Session Details:
        - Duration: ${sessionData.duration} minutes
        - Subject: ${sessionData.subjectName || "Not specified"}
        - Materials: ${
          sessionData.materialsCovered?.join(", ") || "None specified"
        }
        - Notes: ${
          sessionData.notesContent?.substring(0, 2000) || "No notes provided"
        }
        - Focus interruptions: ${sessionData.focusInterruptions || 0}

        Please analyze and respond in JSON format:
        {
          "topicsCovered": ["topic1", "topic2"],
          "keyConceptsLearned": ["concept1", "concept2"],
          "comprehensionScore": 0-100,
          "focusScore": 0-100,
          "productivityScore": 0-100,
          "recommendations": ["recommendation1", "recommendation2"],
          "nextSteps": ["step1", "step2"],
          "weakAreas": ["area1", "area2"],
          "questionsGenerated": ["question1", "question2"]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid AI response format");
      }

      const analysisResult = JSON.parse(jsonMatch[0]);

      return {
        topicsCovered: analysisResult.topicsCovered || [],
        keyConceptsLearned: analysisResult.keyConceptsLearned || [],
        comprehensionScore: this.validateScore(
          analysisResult.comprehensionScore
        ),
        focusScore: this.calculateFocusScore(
          sessionData.duration,
          sessionData.focusInterruptions
        ),
        productivityScore: this.validateScore(analysisResult.productivityScore),
        recommendations: analysisResult.recommendations || [],
        nextSteps: analysisResult.nextSteps || [],
        weakAreas: analysisResult.weakAreas || [],
        questionsGenerated: analysisResult.questionsGenerated || [],
      };
    } catch (error) {
      console.error("Error in AI study analysis:", error);

      return {
        topicsCovered: sessionData.materialsCovered || [],
        keyConceptsLearned: [],
        comprehensionScore: 50,
        focusScore: this.calculateFocusScore(
          sessionData.duration,
          sessionData.focusInterruptions
        ),
        productivityScore: 50,
        recommendations: [
          "Review session materials again",
          "Take more detailed notes",
        ],
        nextSteps: ["Continue with next topic", "Practice with questions"],
        weakAreas: [],
        questionsGenerated: [],
      };
    }
  }

  // Validate uploaded notes against reading material
  async validateNotes(
    notesContent: string,
    readingMaterialContent?: string,
    expectedTopics?: string[]
  ): Promise<IAINotesValidation> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `
        Validate these study notes against the source material and expected topics:

        Notes: ${notesContent.substring(0, 4000)}
        Expected Topics: ${expectedTopics?.join(", ") || "Not specified"}
        Source Material: ${
          readingMaterialContent?.substring(0, 4000) || "Not provided"
        }

        Analyze the notes and respond in JSON format:
        {
          "comprehensionScore": 0-100,
          "completenessScore": 0-100,
          "accuracyScore": 0-100,
          "missingTopics": ["topic1", "topic2"],
          "suggestions": ["suggestion1", "suggestion2"],
          "feedback": "Detailed feedback on the notes",
          "coveragePercentage": 0-100
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid AI response format");
      }

      const validationResult = JSON.parse(jsonMatch[0]);

      return {
        comprehensionScore: this.validateScore(
          validationResult.comprehensionScore
        ),
        completenessScore: this.validateScore(
          validationResult.completenessScore
        ),
        accuracyScore: this.validateScore(validationResult.accuracyScore),
        missingTopics: validationResult.missingTopics || [],
        suggestions: validationResult.suggestions || [],
        feedback: validationResult.feedback || "No specific feedback available",
        coveragePercentage: this.validateScore(
          validationResult.coveragePercentage
        ),
      };
    } catch (error) {
      console.error("Error in AI notes validation:", error);

      return {
        comprehensionScore: 60,
        completenessScore: this.calculateCompletenessScore(
          notesContent,
          expectedTopics
        ),
        accuracyScore: 70,
        missingTopics: expectedTopics
          ? this.findMissingTopics(notesContent, expectedTopics)
          : [],
        suggestions: ["Add more detailed explanations", "Include examples"],
        feedback: "AI validation failed. Basic analysis performed.",
        coveragePercentage: 50,
      };
    }
  }

  // Generate study questions based on content
  async generateStudyQuestions(
    content: string,
    difficulty: Difficulty = Difficulty.MEDIUM,
    questionCount: number = 5
  ): Promise<string[]> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
      });

      const prompt = `
        Generate ${questionCount} study questions based on this content.
        Difficulty level: ${difficulty}
        Content: ${content.substring(0, 4000)}

        Generate questions that test understanding, application, and analysis.
        Return as a JSON array of strings: ["question1", "question2", ...]
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Invalid AI response format");
      }

      const questions = JSON.parse(jsonMatch[0]);
      return Array.isArray(questions) ? questions : [];
    } catch (error) {
      console.error("Error generating study questions:", error);
      return ["What are the main concepts covered in this material?"];
    }
  }

  // Helper methods
  private validateDifficulty(difficulty: string): Difficulty {
    const validDifficulties = [
      Difficulty.EASY,
      Difficulty.MEDIUM,
      Difficulty.HARD,
    ];
    return validDifficulties.includes(difficulty as Difficulty)
      ? (difficulty as Difficulty)
      : Difficulty.MEDIUM;
  }

  private validateScore(score: any): number {
    const numScore = Number(score);
    return isNaN(numScore) ? 50 : Math.max(0, Math.min(100, numScore));
  }

  private calculateFocusScore(
    duration: number,
    interruptions: number = 0
  ): number {
    const baseScore = 100;
    const interruptionPenalty = interruptions * 10;
    const durationBonus = Math.min(20, duration / 5); // Bonus for longer sessions

    return Math.max(
      0,
      Math.min(100, baseScore - interruptionPenalty + durationBonus)
    );
  }

  private extractTopicsFallback(content: string): string[] {
    // Simple keyword extraction
    const commonWords = [
      "the",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
    ];
    const words = content.toLowerCase().split(/\W+/);
    const wordFreq: { [key: string]: number } = {};

    words.forEach((word) => {
      if (word.length > 3 && !commonWords.includes(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    return Object.keys(wordFreq)
      .sort((a, b) => wordFreq[b] - wordFreq[a])
      .slice(0, 5)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  }

  private extractKeyPointsFallback(content: string): string[] {
    // Extract sentences that might be key points
    const sentences = content.split(/[.!?]+/);
    return sentences
      .filter((sentence) => sentence.length > 20 && sentence.length < 200)
      .slice(0, 3)
      .map((sentence) => sentence.trim());
  }

  private assessDifficultyFallback(content: string): Difficulty {
    const complexWords = content.match(/\b\w{8,}\b/g) || [];
    const complexityRatio = complexWords.length / content.split(/\s+/).length;

    if (complexityRatio > 0.3) return Difficulty.HARD;
    if (complexityRatio > 0.15) return Difficulty.MEDIUM;
    return Difficulty.EASY;
  }

  private calculateCompletenessScore(
    notes: string,
    expectedTopics?: string[]
  ): number {
    if (!expectedTopics) return 60;

    const notesLower = notes.toLowerCase();
    const coveredTopics = expectedTopics.filter((topic) =>
      notesLower.includes(topic.toLowerCase())
    );

    return Math.round((coveredTopics.length / expectedTopics.length) * 100);
  }

  private findMissingTopics(notes: string, expectedTopics: string[]): string[] {
    const notesLower = notes.toLowerCase();
    return expectedTopics.filter(
      (topic) => !notesLower.includes(topic.toLowerCase())
    );
  }
}

export default new LearningAIService();
