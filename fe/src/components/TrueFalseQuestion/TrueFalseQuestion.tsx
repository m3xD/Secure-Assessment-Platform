import React from 'react';
import { Form } from 'react-bootstrap';
import { StartAssessmentQuestions } from '../../types/StudentServiceTypes';

interface TrueFalseQuestionProps {
  question: StartAssessmentQuestions;
  selectedAnswer: string;
  onChange: (answer: string) => void;
}

const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  question,
  selectedAnswer,
  onChange
}) => {
  return (
    <div className="true-false-question">
      <div className="question-text">{question.text}</div>
      
      <div className="options-list">
        {/* Instead of mapping over options, render fixed True/False options */}
        <div 
          className={`option-item ${selectedAnswer === 'true' ? 'selected' : ''}`}
          onClick={() => onChange('true')}
        >
          <Form.Check
            type="radio"
            id={`option-true-${question.id}`}
            label="True"
            checked={selectedAnswer === 'true'}
            onChange={() => onChange('true')}
          />
        </div>
        
        <div 
          className={`option-item ${selectedAnswer === 'false' ? 'selected' : ''}`}
          onClick={() => onChange('false')}
        >
          <Form.Check
            type="radio"
            id={`option-false-${question.id}`}
            label="False"
            checked={selectedAnswer === 'false'}
            onChange={() => onChange('false')}
          />
        </div>
      </div>
    </div>
  );
};

export default TrueFalseQuestion;