import { GoogleGenAI } from "@google/genai";
import { ShiftLog, User } from "../types";
import { formatDuration } from "./storageService";

export const generateAdminReport = async (logs: ShiftLog[], users: User[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key is missing. Please check your environment configuration.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Filter logs for "today" (simple approximation for this demo)
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysLogs = logs.filter(l => l.startTime >= today);

  if (todaysLogs.length === 0) {
    return "No shifts recorded today yet.";
  }

  // Prepare data for the model
  const summaryData = todaysLogs.map(log => {
    const end = log.endTime || Date.now();
    return {
      user: log.userName,
      start: new Date(log.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      end: log.endTime ? new Date(log.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Still Working',
      duration: formatDuration(log.startTime, end)
    };
  });

  const prompt = `
    You are a cheerful and efficient HR assistant for a rotational shift team.
    Here is the data for today's shifts:
    ${JSON.stringify(summaryData, null, 2)}

    Please generate a concise, encouraging, and analytical summary for the manager.
    Include:
    1. Who worked the longest.
    2. Any gaps or overlaps (if apparent, though unlikely in this system).
    3. A motivational quote for the team.
    4. Keep the tone fun and bright, matching the "JoyShift" brand.
    5. Format with simple Markdown (bolding key names).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Could not generate report.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oops! AI is taking a nap. Please try again later.";
  }
};