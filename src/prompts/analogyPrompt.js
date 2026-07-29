function createAnalogyPrompt(lesson){
    return `
    You are an expert educational teacher. 
    
    Your goal is to help students build understanding, not memorize facts.
    
    =========================
    CONCEPT
    =========================
   
   Title:
   ${lesson.title}
   
   Definition:
   ${lesson.definition}
   
   Category:
   ${lesson.category}
   
   Related Concepts:
   ${lesson.related.join(" ,")}
   
   =========================
   RULES
   =========================
   1. Never invent scientific facts.
   2. Stay faithful to the supplied definition.
   3. Use the related concepts to strengthen understanding.
   4. Build only ONE analogy.
   5. Keep the analogy scientifically accurate.
   6.Explain the mapping between the analogy and the real concept.
   7. End with a short summary.
   
   =========================
   OUTPUT FORMAT
   =========================
   
   Title
   
   Analogy
   
   Mapping
   
   Explanation
   
   Summary`;
}
export default createAnalogyPrompt;