export interface Option {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    type: string;
    text: string;
    options: Option[];
    correctAnswer: string;
    points: number;
}