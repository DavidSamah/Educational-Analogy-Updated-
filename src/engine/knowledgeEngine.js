import knowledgeGraph from "../knowledge/graph";

function findConcept(name){
    return knowledgeGraph[name];
}

function getPrerequisites(name){
    const lesson = knowledgeGraph[name];

    if (!lesson) return [];

    return lesson.prerequisites;
}

function getRelated(name){
    const lesson = knowledgeGraph[name];

    if (!lesson) return [];

    return lesson.related;

}
export {
    findConcept,
    getPrerequisites,
    getRelated
}
