import { useEffect, useState } from "react";
import { Quiz } from "../types/QuizTypes";
import quizService from "../services/quizService";

export const useExams = () => {
    const [exams, setExams] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const data = await quizService.getAllExams();
            setExams(data);
        } catch (error) {
            setError("Failed to fetch exams");
        } finally {
            setLoading(false);
        }
    }

    return { exams, loading, error };
};