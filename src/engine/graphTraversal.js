import knowledgeGraph from "../knowledge/graph";

function getRelatedConcepts(concept){
    const node = knowledgeGraph[concept];

    if (!node) {
        return [];
    }

    return node.related;
}

export default getRelatedConcepts;