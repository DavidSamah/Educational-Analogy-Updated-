import { useState, useCallback } from "react";
import { generateAnalogy } from "../api/analogyApi";

export default function useAnalogyGeneration() {
  const [state, setState] = useState({
    loading: false,
    error: null,
    result: null,
  });

  const generate = useCallback(async ({ concept, perspective, style, difficulty }) => {
    setState({ loading: true, error: null, result: null });
    try {
      const response = await generateAnalogy(concept, perspective);
      setState({ loading: false, error: null, result: { concept, perspective, style, difficulty, content: response } });
      return response;
    } catch (err) {
      setState({ loading: false, error: err.message || "Something went wrong.", result: null });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, error: null, result: null });
  }, []);

  return { ...state, generate, reset };
}
