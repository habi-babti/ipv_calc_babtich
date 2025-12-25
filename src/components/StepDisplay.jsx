import './StepDisplay.css';

function StepDisplay({ steps }) {
  return (
    <div className="steps-container">
      {steps.map((step, index) => (
        <div key={index} className="step-card">
          <div className="step-header">
            <span className="step-number">{index + 1}</span>
            <h3>{step.title}</h3>
          </div>
          <div className="step-explanation">
            {step.explanation.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
          <div className="step-result">
            <strong>→ {step.result}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StepDisplay;
