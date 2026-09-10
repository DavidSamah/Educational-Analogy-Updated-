export async function generateAnalogy(concept, perspective) {
    const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            concept,
            perspective,
        })
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to contact OpenRouter");
    }

    const data = await response.json();

    return data.content;
}
