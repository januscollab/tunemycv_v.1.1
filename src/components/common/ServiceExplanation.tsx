
import React from 'react';

interface ServiceExplanationProps {
  title: string;
  subtitle: string;
  benefits: string[];
  features: string[];
  icon: React.ReactNode;
  compact?: boolean;
}

const ServiceExplanation: React.FC<ServiceExplanationProps> = ({
  title,
  subtitle,
  benefits,
  features,
  icon,
  compact = false
}) => {
  return (
    <div className={`bg-white dark:bg-earth/10 rounded-lg shadow-sm p-6 border border-apple-core/20 dark:border-citrus/10 h-full ${compact ? 'max-w-xl' : ''}`}>
      {title && subtitle && (
        <div className="flex items-center mb-5">
          <div className="mr-3">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-earth dark:text-white mb-2 font-display">
              {title}
            </h2>
            <p className="text-base text-earth/70 dark:text-white/70">
              {subtitle}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <div className="flex items-center mb-3">
            <div className="w-6 h-6 flex items-center justify-center mr-2">
              {React.cloneElement(icon as React.ReactElement, { className: "h-5 w-5 text-zapier-orange" })}
            </div>
            <h3 className="text-lg font-semibold text-earth dark:text-white font-display">
              Key Benefits
            </h3>
          </div>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <div className="w-1.5 h-1.5 bg-zapier-orange rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-earth/70 dark:text-white/70 text-sm">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-earth dark:text-white mb-3 font-display">
            How It Works
          </h3>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="w-5 h-5 bg-zapier-orange/15 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-semibold text-zapier-orange">
                    {index + 1}
                  </span>
                </div>
                <span className="text-earth/70 dark:text-white/70 text-sm">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServiceExplanation;
