import buildLesson from "../engine/lessonBuilder";
import createAnalogyPrompt from "../prompts/analogyPrompt";
import {generateAnalogy} from "../api/analogyApi";

async function generateLesson(concept){
    const lesson = buildLesson(concept);

    if (!lesson) {
        return {
            error: "Concept not found."
        };
    }

    const prompt = createAnalogyPrompt(lesson);

    const response = await generateAnalogy(prompt);

    return {
        lesson,
        response
    };
}
export default generateLesson;