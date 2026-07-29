const knowledgeGraph = {
    Gravity: {
        title: "Gravity",

        definition:
        "A force that attracts objects with mass.",

        category: "Physics",

        prerequisites: [
            "Mass",
            "Force"
        ],
        related: [
            {
                concept: "Mass",
                relationship: "depends_on"
            },

            {
                concept: "Force",
                relationship: "is_a"
            },
            {concept: "Acceleration",
                relationship: "causes"
            },

            {
                concept: "Orbit",
                relationship: "creates"
            }
        ],
        misconceptions: [
            "Gravity only exists on Earth.",
            "Heavier objects always falls faster."
        ],
    }
};

export default knowledgeGraph