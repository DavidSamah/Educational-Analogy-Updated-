import knowledgeGraph from "../knowledge/graph";
import getRelatedConcepts from "./graphTraversal"

function buildLesson(concept){

    const node = knowledgeGraph[concept];

    if (!node){
        return null;
    }

    return {
        title: concept,
        definition: node.definition,
        category: node.category,
        related: getRelatedConcepts(concept)
    };
}
export default buildLesson;