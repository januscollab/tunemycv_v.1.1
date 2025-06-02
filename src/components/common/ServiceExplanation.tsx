
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
    <div className={`bg-white dark:bg-blueberry/10 rounded-lg shadow-sm p-6 border border-apple-core/20 dark:border-citrus/10 h-full ${compact ? 'max-w-xl' : ''}`}>
      <div className="flex items-center mb-5">
        <div className="mr-3">
          {icon}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-blueberry dark:text-citrus mb-2">
            {title}
          </h2>
          <p className="text-base text-blueberry/70 dark:text-apple-core/70">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3">
            Key Benefits
          </h3>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <div className="w-1.5 h-1.5 bg-apricot rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-blueberry/70 dark:text-apple-core/70 text-sm">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3">
            How It Works
          </h3>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="w-5 h-5 bg-citrus/15 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-semibold text-citrus">
                    {index + 1}
                  </span>
                </div>
                <span className="text-blueberry/70 dark:text-apple-core/70 text-sm">
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
