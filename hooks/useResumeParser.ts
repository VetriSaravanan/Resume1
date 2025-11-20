import { useState, useCallback } from 'react';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import type { ResumeData } from '../types';

export const useResumeParser = () => {
    const [parsedData, setParsedData] = useState<ResumeData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearError = useCallback(() => setError(null), []);

    const parseResume = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        
        if (!process.env.API_KEY) {
            setError("Gemini API Key is missing.");
            setIsLoading(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const base64Data = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    // Remove data URL prefix if present
                    const base64 = result.split(',')[1]; 
                    resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            // Robust MIME type detection
            let mimeType = file.type;
            if (!mimeType) {
                 const ext = file.name.split('.').pop()?.toLowerCase();
                 if (ext === 'pdf') mimeType = 'application/pdf';
                 else if (ext === 'png') mimeType = 'image/png';
                 else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
                 else mimeType = 'application/pdf'; // Default fallback
            }

            const systemInstruction = `
                You are an expert resume parser. Your job is to extract information from the provided resume file and structure it into a precise JSON format.
                
                Output JSON Schema:
                {
                    "name": "string (Full Name)",
                    "title": "string (Current Professional Title)",
                    "summary": "string (Professional Summary - keep it concise)",
                    "contact": {
                        "email": "string",
                        "phone": "string",
                        "location": "string",
                        "linkedin": "string (URL)",
                        "github": "string (URL)",
                        "website": "string (URL)"
                    },
                    "experience": [
                        {
                            "id": "uuid",
                            "role": "string",
                            "company": "string",
                            "dates": "string (e.g., Jan 2020 - Present)",
                            "description": ["string (Bullet point 1)", "string (Bullet point 2)"]
                        }
                    ],
                    "education": [
                        {
                            "id": "uuid",
                            "institution": "string",
                            "degree": "string",
                            "dates": "string",
                            "details": "string (Optional details like GPA or honors)"
                        }
                    ],
                    "skills": [{ "id": "uuid", "name": "string" }],
                    "projects": [
                        {
                            "id": "uuid",
                            "name": "string",
                            "description": "string",
                            "technologies": ["string"],
                            "link": "string"
                        }
                    ],
                    "certifications": [{ "id": "uuid", "name": "string", "issuer": "string", "date": "string" }],
                    "volunteerWork": [{ "id": "uuid", "organization": "string", "role": "string", "dates": "string", "description": ["string"] }],
                    "publications": [{ "id": "uuid", "title": "string", "publisher": "string", "date": "string", "link": "string", "description": "string" }],
                    "languages": [{ "id": "uuid", "name": "string", "proficiency": "string" }],
                    "hobbies": [{ "id": "uuid", "name": "string" }],
                    "sectionOrder": ["experience", "education", "details"]
                }

                Rules:
                1. Return ONLY the JSON. No markdown formatting, no backticks.
                2. Generate a random UUID for every 'id' field.
                3. If a field is missing in the resume, use an empty string or empty array.
                4. Infer the 'title' from the most recent experience if not explicitly stated.
                5. Ensure 'sectionOrder' contains 'experience', 'education', and 'details'.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [
                    {
                        parts: [
                            { 
                                inlineData: {
                                    mimeType: mimeType,
                                    data: base64Data
                                }
                            },
                            { text: "Extract the data from this resume and structure it into the required JSON format. Do not include markdown formatting." }
                        ]
                    }
                ],
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    // Increasing temperature helps avoid Recitation blocks on template-like content
                    temperature: 0.4,
                    safetySettings: [
                        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                        { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE },
                    ],
                }
            });

            const textRaw = response.text;
            
            if (!textRaw) {
                const finishReason = response.candidates?.[0]?.finishReason;
                console.error("Gemini API Error - No text generated. Finish Reason:", finishReason);
                throw new Error(`No response from AI. Finish reason: ${finishReason || 'Unknown'}`);
            }

            let text = textRaw.trim();
            // Clean up markdown if the model ignores the system instruction about raw JSON
            if (text.startsWith('```json')) {
                text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
            } else if (text.startsWith('```')) {
                text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');
            }

            let data: ResumeData;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("JSON Parse Error:", e, text);
                throw new Error("Failed to parse AI response as JSON.");
            }
            
            // Post-processing to ensure IDs exist
            const ensureId = (arr: any[]) => arr?.map((item: any) => ({ ...item, id: item.id || crypto.randomUUID() })) || [];
            
            data.experience = ensureId(data.experience);
            data.education = ensureId(data.education);
            data.skills = ensureId(data.skills);
            data.projects = ensureId(data.projects);
            data.certifications = ensureId(data.certifications);
            data.volunteerWork = ensureId(data.volunteerWork);
            data.publications = ensureId(data.publications);
            data.languages = ensureId(data.languages);
            data.hobbies = ensureId(data.hobbies);
            
            if (!data.sectionOrder) data.sectionOrder = ['experience', 'education', 'details'];
            
            // Default Animations to false (off by default)
            if (data.enableAnimations === undefined) data.enableAnimations = false;

            setParsedData(data);
        } catch (err: any) {
            console.error("Error parsing resume:", err);
            setError(err.message || "Failed to parse resume");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { parsedData, isLoading, error, parseResume, clearError };
};