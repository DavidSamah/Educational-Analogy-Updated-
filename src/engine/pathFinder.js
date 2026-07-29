import knowledgeGraph from "../knowledge/graph";

function buildLearningPath(conceptName){
    const lesson = knowledgeGraph[conceptName];

    if(!lesson){
        return [];
    }
    return lesson.prerequisites || [];
    
}
export default buildLearningPath