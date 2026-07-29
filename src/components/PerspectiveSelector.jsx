function PerspectiveSelector({perspective, setPerspective}){
    return (
        <select
        value={perspective}
        onChange={(e) =>
            setPerspective(e.target.value)}>
            <option>Cooking</option>
            <option>Football</option>
            <option>Nature</option>
            <option>Business</option>
            <option>Programming</option>
        </select>
    );
}
export default PerspectiveSelector;