import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProgressIndicator, Spinner, LoadingDots, BounceLoader, WaveLoader, PulseRing, MorphingDots } from '@/components/ui/progress-indicator';
import { MinimalUploadModal, EngagingUploadModal, AnimatedUploadModal } from '@/components/ui/file-upload-modals';

interface LoadingShowcaseProps {
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
}

export const LoadingStatesShowcase: React.FC<LoadingShowcaseProps> = ({ 
  activeModal, 
  setActiveModal 
}) => {
  const [isPlaying, setIsPlaying] = useState(true);

  const loadingComponents = [
    {
      name: 'Progress Indicator',
      component: <ProgressIndicator value={65} label="Uploading" />,
      usage: '23 usages',
      description: 'Standard progress bar with percentage and labels'
    },
    {
      name: 'Spinner',
      component: <Spinner size="md" />,
      usage: '45 usages', 
      description: 'Classic rotating spinner for general loading'
    },
    {
      name: 'Loading Dots',
      component: <LoadingDots size="md" />,
      usage: '12 usages',
      description: 'Pulsing dots for subtle loading states'
    },
    {
      name: 'Bounce Loader',
      component: <BounceLoader size="md" />,
      usage: '8 usages',
      description: 'Bouncing dots for playful interactions'
    },
    {
      name: 'Wave Loader',
      component: <WaveLoader size="md" />,
      usage: '5 usages',
      description: 'Wave animation for audio/processing contexts'
    },
    {
      name: 'Pulse Ring',
      component: <PulseRing size="md" />,
      usage: '3 usages',
      description: 'Expanding rings for attention-grabbing loading'
    },
    {
      name: 'Morphing Dots',
      component: <MorphingDots size="md" />,
      usage: '2 usages',
      description: 'Shape-changing dots for creative loading states'
    }
  ];

  const fileUploadModals = [
    {
      name: 'Minimal Upload Modal',
      description: 'Clean, professional modal with progress bar',
      key: 'minimal'
    },
    {
      name: 'Engaging Upload Modal', 
      description: 'Interactive modal with stages and visual feedback',
      key: 'engaging'
    },
    {
      name: 'Animated Upload Modal',
      description: 'Playful modal with rotating animations',
      key: 'animated'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Loading Components */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title font-bold flex items-center gap-2">
            Loading Components
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pause' : 'Play'} Animations
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loadingComponents.map((item, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-subheading">{item.name}</CardTitle>
                  <Badge variant="outline" className="text-micro">
                    {item.usage}
                  </Badge>
                </div>
                <p className="text-caption text-muted-foreground">
                  {item.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-16 bg-muted/30 rounded-lg">
                  {isPlaying ? item.component : <div className="text-caption text-muted-foreground">Paused</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* File Upload Modal Variants */}
      <section>
        <h2 className="text-title font-bold mb-6">
          File Upload Modal Variants
        </h2>
        
        <div className="grid gap-6 md:grid-cols-3">
          {fileUploadModals.map((modal, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-subheading">{modal.name}</CardTitle>
                <p className="text-caption text-muted-foreground">
                  {modal.description}
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  onClick={() => setActiveModal(modal.key)}
                  className="w-full"
                >
                  Preview Modal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Progress Variants */}
      <section>
        <h2 className="text-title font-bold mb-6">
          Progress Indicator Variants
        </h2>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-subheading">Standard Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressIndicator value={25} label="Uploading" />
              <ProgressIndicator value={50} label="Processing" variant="warning" />
              <ProgressIndicator value={75} label="Finalizing" variant="success" />
              <ProgressIndicator value={100} label="Complete" variant="success" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-subheading">Size Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressIndicator value={65} label="Small" size="sm" />
              <ProgressIndicator value={65} label="Medium" size="md" />
              <ProgressIndicator value={65} label="Large" size="lg" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modal Components */}
      <MinimalUploadModal
        isOpen={activeModal === 'minimal'}
        onCancel={() => setActiveModal(null)}
      />
      
      <EngagingUploadModal
        isOpen={activeModal === 'engaging'}
        onCancel={() => setActiveModal(null)}
      />
      
      <AnimatedUploadModal
        isOpen={activeModal === 'animated'}
        onCancel={() => setActiveModal(null)}
      />
    </div>
  );
};