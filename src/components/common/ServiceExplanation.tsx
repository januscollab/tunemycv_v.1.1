
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
    <div className={`bg-white dark:bg-blueberry/20 rounded-xl shadow-lg p-8 border border-apple-core/30 dark:border-citrus/20 h-full ${compact ? 'max-w-2xl' : ''}`}>
      <div className="flex items-center mb-6">
        <div className="mr-4">
          {icon}
        </div>
        <div>
          <h2 className="text-3xl font-bold text-blueberry dark:text-citrus mb-2">
            {title}
          </h2>
          <p className="text-lg text-blueberry/80 dark:text-apple-core/80">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-3">
            Key Benefits
          </h3>
          <ul className="space-y-2">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start">
                <div className="w-2 h-2 bg-apricot rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <span className="text-blueberry/80 dark:text-apple-core/80">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-blueberry dark:text-citrus mb-3">
            How It Works
          </h3>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <div className="w-6 h-6 bg-citrus/20 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                  <span className="text-xs font-semibold text-citrus">
                    {index + 1}
                  </span>
                </div>
                <span className="text-blueberry/80 dark:text-apple-core/80">
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
