
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Sparkles } from 'lucide-react';

interface ServiceExplanationProps {
  title: string;
  subtitle: string;
  benefits: string[];
  features: string[];
  icon?: React.ReactNode;
}

const ServiceExplanation: React.FC<ServiceExplanationProps> = ({
  title,
  subtitle,
  benefits,
  features,
  icon
}) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          {icon || <Sparkles className="h-8 w-8 text-apricot" />}
        </div>
        <h1 className="text-4xl font-bold text-blueberry dark:text-citrus mb-4">{title}</h1>
        <p className="text-xl text-blueberry/80 dark:text-apple-core max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-blueberry dark:text-citrus">Why Use Our Service?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3">Key Benefits</h3>
            <ul className="space-y-2">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-blueberry/80 dark:text-apple-core/80">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-blueberry dark:text-citrus mb-3">How It Works</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-apricot text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-blueberry/80 dark:text-apple-core/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ServiceExplanation;
