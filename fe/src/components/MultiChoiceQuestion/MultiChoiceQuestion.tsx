import React from 'react';
import { Form } from 'react-bootstrap';
import { StartAssessmentQuestions } from '../../types/StudentServiceTypes';

interface MultiChoiceQuestionProps {
  question: StartAssessmentQuestions;
  selectedAnswer: string;
  onChange: (answer: string) => void;
}

const MultiChoiceQuestion: React.FC<MultiChoiceQuestionProps> = ({
  question,
  selectedAnswer,
  onChange
}) => {
  return (
    <div className="multiple-choice-question">
      <div className="question-text">{question.text}</div>
      
      <div className="options-list">
        {question.options.map(option => (
          <div 
            key={option.optionId}
            className={`option-item ${selectedAnswer === option.optionId ? 'selected' : ''}`}
            onClick={() => onChange(option.optionId)}
          >
            <Form.Check
              type="radio"
              id={`option-${option.optionId}`}
              label={option.text}
              checked={selectedAnswer === option.optionId}
              onChange={() => onChange(option.optionId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiChoiceQuestion;