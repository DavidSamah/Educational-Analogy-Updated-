const API_URL = 
"https://openrouter.ai/api/v1/chat/completions";

export async function generateAnalogy(concept, perspective) {

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
            model: "openai/gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are Analogy, an educational AI.
                    Your ONLY job is to explain concepts through structural analogies.
                    
                    Always respond using exactly this format:
                    Title

                    Analogy
                    
                    Mapping
                    - A to B
                    - C to D
                    
                    Explanation
                    
                    Summary
                    
                    Never ask follow-up questions.
                    Never refuse.
                    Never say "tell me more."
                    Always answer immediately.`
                },
                {
                    role: "user",
                    content:` Explain "${concept}"  using the perspective of "${perspective}".`
                }
            ]
        })
    });
    if (!response.ok) {
        throw new Error("Failed to contact OpenRouter")
    }

    const data = await response.json();

    return data.choices[0].message.content;
}
