function Result({result}) {
    return (
        <div> 
            <h3>Result</h3>
            <p>{result || "Your generated analogy will appear here."}</p>
             </div>
    );
}

export default Result;