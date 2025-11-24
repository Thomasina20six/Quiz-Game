import express from "express";
import OpenAI from "openai";
import cors from "cors";

const app = express();

// allow calls from your dev page on 127.0.0.1:5500 or localhost:5500
app.use(cors({ origin: [/^http:\/\/(127\.0\.0\.1|localhost):5500$/] }));

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

// GET
app.get("/api/quiz", async(req, res) => {
    // if the topic is not provided we ask ai to pick one
    const {topic = "", difficulty ="medium", count ="3"} = req.query;
    const n = Math.min(10, Math.max(3, parseInt(count, 10) || 3));

    const schema = {
        type: "object",
        additionalProperties: false,
        required: ["topic","questions"],
        properties: {
            topic: {type:"string"},
            questions: {
                type: "array",
                minItems: n,
                maxItems: n,
                items: {
                    type: "object",
                    additionalProperties: false,
                    required: ["question", "choices", "correctIndex"],
                    properties: {
                        question: { type: "string" },
                        choices: {
                            type: "array",
                            items: { type: "string" },
                            minItems: 4,
                            maxItems: 4
                        },
                    correctIndex: { type: "integer", minimum: 0, maximum: 3 }
                    }
                }
            }
        }
    };

    const topicPrompt = topic && topic.trim().length
        ? `Use this exact topic: "${topic}".`
        : `Choose a clear, family-friendly, factual topic(e.g., science, history, 
        geography, arts, technology, nature, inventions, world cultures, notable people, 
        world wonders, materials like wood/steel, etc.). Avoid current politics or 
        adult themes.`;

    const instructions =`
        You are a quiz generator. ${topicPrompt}
        - Generate ${n} UNIQUE multiple-choice questions on ONE topic for this round.
        - Each question has EXACTLY four choices and exactly ONE correct answer.
        - Keep facts accurate and classroom-safe.
        Return ONLY JSON matching the schema. Set the "topic" field to the chosen topic title.`;

    try{
        const ai = await openai.responses.create({
            model: "gpt-4o-mini",
            instructions,
            input: "Return the quiz JSON per the schema.",
            text: {
                format: {
                    type: "json_schema",
                    name: "QuizPayload",
                    strict: true,
                    schema,                
                },
            },
            temperature: 0.9,
            max_output_tokens:1200,
        });

        const payload = JSON.parse(ai.output_text);
        if(!payload?.questions?.length || !payload?.topic){ 
            throw new Error("Invalid payload");
        }

        const cleaned = payload.questions.slice(0,n).map(q => {
            const choices = (q.choices || []).slice(0,4);
            const idx = Math.max(0, Math.min(3, q.correctIndex ?? 0));
            return {
                question: String(q.question || "").trim(),
                choices, 
                correctIndex: idx
            };
        });

        res.json({topic: String(payload.topic).trim(), questions: cleaned});
    }catch(err){
        console.error("Quiz generation failed:", err);
        res.status(500).json({error: "Failed to generate quiz"});
    }
});

app.listen(3000, () => console.log("Quiz API listening on http://localhost:3000"));