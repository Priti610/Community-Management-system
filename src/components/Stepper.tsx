import React from 'react';
import { Check, X } from 'lucide-react';

interface StepperProps {
  currentStatus: string;
}

const STEPS = [
  { id: 1, label: 'Submitted', key: 'Submitted' },
  { id: 2, label: 'Under Review', key: 'Under Review' },
  { id: 3, label: 'Assigned', key: 'Assigned' },
  { id: 4, label: 'In Progress', key: 'In Progress' },
  { id: 5, label: 'Resolved', key: 'Resolved' },
];

export const Stepper: React.FC<StepperProps> = ({ currentStatus }) => {
  const isRejected = currentStatus === 'Rejected';

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'Under Review':
        return 1;
      case 'Assigned':
        return 2;
      case 'In Progress':
        return 3;
      case 'Resolved':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = isRejected ? -1 : getStepIndex(currentStatus);

  if (isRejected) {
    return (
      <div className="flex items-center justify-center p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
        <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center mr-3 font-bold">
          <X className="w-5 h-5" />
        </div>
        <div>
          <div className="font-semibold text-rose-900">Complaint Rejected</div>
          <div className="text-xs text-rose-600 mt-0.5">
            This issue could not be accepted for municipal dispatch. Review admin remarks below.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto px-4">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <React.Fragment key={step.id}>
              {/* Step indicator node */}
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-medium text-sm transition-all ${
                    isCompleted || isCurrent
                      ? 'bg-[#1E66F5] text-white shadow-sm ring-4 ring-blue-50'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted || isCurrent ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <span
                  className={`mt-2.5 text-xs text-center font-medium ${
                    isCurrent
                      ? 'text-slate-900 font-semibold'
                      : isCompleted
                      ? 'text-slate-700'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 -mt-5 relative z-0">
                  <div
                    className={`h-full ${
                      index < currentIndex ? 'bg-[#1E66F5]' : 'bg-slate-200'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
