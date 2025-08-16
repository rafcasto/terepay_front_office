'use client';

import { useOnboardingStore } from '@/store/onboardingStore';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

type LoanStatus = 'submitted' | 'assessment' | 'decision_pending' | 'approved' | 'declined';

interface StatusStep {
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
}

interface LoanApplication {
  status: LoanStatus;
  submittedAt?: Date;
  lastUpdated?: Date;
  estimatedCompletionDays?: number;
}

const LoanStatusTracker = () => {
  const { data } = useOnboardingStore();
  
  // This would come from your backend in a real application
  const application: LoanApplication = {
    status: 'assessment',
    submittedAt: new Date(),
    lastUpdated: new Date(),
    estimatedCompletionDays: 3
  };

  const currentStatus = application.status;

  const getStepStatus = (step: number): StatusStep['status'] => {
    const stepOrder = {
      submitted: 0,
      assessment: 1,
      decision_pending: 2,
      approved: 3,
      declined: 3
    };

    const currentStep = stepOrder[currentStatus];
    
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'pending';
  };

  const statusSteps: StatusStep[] = [
    {
      title: 'Application Submitted',
      description: 'Your loan application has been successfully submitted.',
      status: getStepStatus(0)
    },
    {
      title: 'Credit Assessment',
      description: 'Our team is reviewing your application and documentation.',
      status: getStepStatus(1)
    },
    {
      title: 'Decision Pending',
      description: 'Final review and decision making in progress.',
      status: getStepStatus(2)
    },
    {
      title: 'Final Decision',
      description: 'You will be notified once a decision has been made.',
      status: getStepStatus(3)
    }
  ];

  const getStatusIcon = (status: StatusStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'current':
        return <Clock className="w-8 h-8 text-blue-500 animate-pulse" />;
      case 'pending':
        return <div className="w-8 h-8 rounded-full border-2 border-gray-300" />;
    }
  };

  const getLineColor = (status: StatusStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'current':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Loan Application Status</h2>
      
      <div className="space-y-8">
        {statusSteps.map((step, index) => (
          <div key={step.title} className="relative">
            {/* Connector Line */}
            {index < statusSteps.length - 1 && (
              <div 
                className={`absolute left-4 top-12 w-0.5 h-20 transform -translate-x-1/2 ${
                  getLineColor(step.status)
                }`}
              />
            )}
            
            {/* Step Content */}
            <div className="relative flex items-start">
              {/* Icon */}
              <div className="flex-shrink-0">
                {getStatusIcon(step.status)}
              </div>

              {/* Text Content */}
              <div className="ml-4">
                <h3 className={`text-lg font-semibold ${
                  step.status === 'current' ? 'text-blue-600' :
                  step.status === 'completed' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {step.description}
                </p>
                
                {step.status === 'current' && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                    <p className="text-sm text-blue-700">
                      {step.title === 'Credit Assessment' && 'Our team is currently reviewing your application. This typically takes 1-2 business days.'}
                      {step.title === 'Decision Pending' && 'Final review in progress. You will be notified shortly.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Info */}
      <div className="mt-8 space-y-4">
        {application.submittedAt && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm text-gray-600">
                  Submitted on: {application.submittedAt.toLocaleDateString()}
                </p>
                {application.lastUpdated && application.lastUpdated > application.submittedAt && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {application.lastUpdated.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-gray-400 mr-2" />
            <p className="text-sm text-gray-600">
              Estimated completion time: {application.estimatedCompletionDays} business days
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanStatusTracker;
