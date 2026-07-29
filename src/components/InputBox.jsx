function InputBox({concept, setConcept}) {
    return (
        <input 
        type = "text"
        placeholder="Enter a concept..."
        value={concept}
        onChange={(e) =>
            setConcept(e.target.value)} />
            
    );
}
export default InputBox;
