"use client";

import React, { useState } from 'react';
import CategorySelectionStep from './components/CategorySelectionStep';
import ProjectDetailsStep, { ProjectDetailsData } from './components/ProjectDetailsStep';
import PreviewStep from './components/PreviewStep';

type Step = 'category' | 'details' | 'preview';

interface FormData extends ProjectDetailsData {
  category?: string;
  subcategory?: string;
}

export default function MarketplacePage() {
  const [currentStep, setCurrentStep] = useState<Step>('category');
  const [formData, setFormData] = useState<FormData>({});

  const handleCategoryNext = (data: { category: string; subcategory: string }) => {
    setFormData((prev: FormData) => ({ ...prev, ...data }));
    setCurrentStep('details');
  };

  const handleDetailsNext = (data: ProjectDetailsData) => {
    setFormData((prev: FormData) => ({ ...prev, ...data }));
    setCurrentStep('preview');
  };

  const handleDetailsBack = () => {
    setCurrentStep('category');
  };

  const handlePreviewBack = () => {
    setCurrentStep('details');
  };

  const handlePublish = () => {
    // Handle publish logic here
    console.log('Publishing ad with data:', formData);
    // You can add API call or navigation here
  };

  return (
    <>
      {currentStep === 'category' && (
        <CategorySelectionStep onNext={handleCategoryNext} />
      )}
      {currentStep === 'details' && (
        <ProjectDetailsStep
          onNext={handleDetailsNext}
          onBack={handleDetailsBack}
          initialData={formData}
        />
      )}
      {currentStep === 'preview' && (
        <PreviewStep
          formData={formData}
          onBack={handlePreviewBack}
          onPublish={handlePublish}
        />
      )}
    </>
  );
}

