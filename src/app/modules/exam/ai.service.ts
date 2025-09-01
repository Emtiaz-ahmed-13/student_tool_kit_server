import { GoogleGenerativeAI } from "@google/generative-ai";
import { Difficulty, QuestionType } from "./exam.types";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface IAIQuestionRequest {
  subject: string;
  topic?: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  count: number;
}

export interface IAIGeneratedQuestion {
  question: string;
  questionType: QuestionType;
  difficulty: Difficulty;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

export class AIQuestionGenerator {
  static async generateQuestions(
    request: IAIQuestionRequest
  ): Promise<IAIGeneratedQuestion[]> {
    const prompt = this.buildPrompt(request);

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return this.parseAIResponse(text, request);
    } catch (error) {
      console.error("Gemini AI Error:", error);
      throw new Error("Failed to generate questions using AI");
    }
  }

  private static buildPrompt(request: IAIQuestionRequest): string {
    const { subject, topic, questionType, difficulty, count } = request;

    let prompt = `Generate ${count} ${difficulty.toLowerCase()} level ${questionType} question(s) about ${subject}`;

    if (topic) {
      prompt += ` focusing on ${topic}`;
    }

    prompt += `.\n\n`;

    if (questionType === QuestionType.MCQ) {
      prompt += `For each question, provide:
- Question text
- 4 multiple choice options (A, B, C, D)
- Correct answer (letter)
- Brief explanation

Format each question as:
QUESTION: [question text]
A) [option 1]
B) [option 2] 
C) [option 3]
D) [option 4]
ANSWER: [correct letter]
EXPLANATION: [brief explanation]
---`;
    } else if (questionType === QuestionType.TRUE_FALSE) {
      prompt += `For each question, provide:
- Statement that can be true or false
- Correct answer (True/False)
- Brief explanation

Format each question as:
QUESTION: [true/false statement]
ANSWER: [True or False]
EXPLANATION: [brief explanation]
---`;
    } else if (questionType === QuestionType.SHORT_ANSWER) {
      prompt += `For each question, provide:
- Question requiring a short answer
- Correct answer
- Brief explanation

Format each question as:
QUESTION: [question text]
ANSWER: [correct answer]
EXPLANATION: [brief explanation]
---`;
    }

    return prompt;
  }

  private static parseAIResponse(
    response: string,
    request: IAIQuestionRequest
  ): IAIGeneratedQuestion[] {
    const questions: IAIGeneratedQuestion[] = [];
    const questionBlocks = response
      .split("---")
      .filter((block) => block.trim());

    questionBlocks.forEach((block) => {
      try {
        const parsed = this.parseQuestionBlock(
          block.trim(),
          request.questionType,
          request.difficulty
        );
        if (parsed) {
          questions.push(parsed);
        }
      } catch (error) {
        console.warn("Failed to parse question block:", error);
      }
    });

    return questions;
  }

  private static parseQuestionBlock(
    block: string,
    questionType: QuestionType,
    difficulty: Difficulty
  ): IAIGeneratedQuestion | null {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    let question = "";
    let options: string[] = [];
    let correctAnswer = "";
    let explanation = "";

    for (const line of lines) {
      if (line.startsWith("QUESTION:")) {
        question = line.replace("QUESTION:", "").trim();
      } else if (line.match(/^[A-D]\)/)) {
        options.push(line.substring(3).trim());
      } else if (line.startsWith("ANSWER:")) {
        correctAnswer = line.replace("ANSWER:", "").trim();
      } else if (line.startsWith("EXPLANATION:")) {
        explanation = line.replace("EXPLANATION:", "").trim();
      }
    }

    if (!question || !correctAnswer) {
      return null;
    }

    // For MCQ, convert letter answer to actual text
    if (questionType === QuestionType.MCQ && options.length >= 4) {
      const letterMap: { [key: string]: number } = { A: 0, B: 1, C: 2, D: 3 };
      const answerIndex = letterMap[correctAnswer.toUpperCase()];
      if (answerIndex !== undefined && options[answerIndex]) {
        correctAnswer = options[answerIndex];
      }
    }

    // For TRUE_FALSE, ensure we have the right options
    if (questionType === QuestionType.TRUE_FALSE) {
      options = ["True", "False"];
    }

    return {
      question,
      questionType,
      difficulty,
      options: questionType === QuestionType.SHORT_ANSWER ? [] : options,
      correctAnswer,
      explanation: explanation || undefined,
    };
  }

  static async generateQuestionsByTopic(
    subject: string,
    topics: string[],
    difficulty: Difficulty
  ): Promise<IAIGeneratedQuestion[]> {
    const allQuestions: IAIGeneratedQuestion[] = [];

    for (const topic of topics) {
      try {
        // Generate a mix of question types for each topic
        const mcqQuestions = await this.generateQuestions({
          subject,
          topic,
          questionType: QuestionType.MCQ,
          difficulty,
          count: 2,
        });

        const tfQuestions = await this.generateQuestions({
          subject,
          topic,
          questionType: QuestionType.TRUE_FALSE,
          difficulty,
          count: 1,
        });

        allQuestions.push(...mcqQuestions, ...tfQuestions);

        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`Failed to generate questions for topic: ${topic}`, error);
      }
    }

    return allQuestions;
  }

  static async generateAdaptiveQuestions(
    subject: string,
    userPerformance: { difficulty: Difficulty; correctRate: number }[],
    count: number = 5
  ): Promise<IAIGeneratedQuestion[]> {
    // Determine difficulty based on user performance
    let targetDifficulty = Difficulty.MEDIUM;

    const recentPerformance = userPerformance.slice(-5); // Last 5 attempts
    const avgCorrectRate =
      recentPerformance.reduce((sum, p) => sum + p.correctRate, 0) /
      recentPerformance.length;

    if (avgCorrectRate > 0.8) {
      targetDifficulty = Difficulty.HARD;
    } else if (avgCorrectRate < 0.5) {
      targetDifficulty = Difficulty.EASY;
    }

    return this.generateQuestions({
      subject,
      questionType: QuestionType.MCQ,
      difficulty: targetDifficulty,
      count,
    });
  }
}

export default AIQuestionGenerator;
