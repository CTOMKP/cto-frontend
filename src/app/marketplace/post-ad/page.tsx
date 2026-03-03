"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import CategorySelectionStep from './features/CategorySelectionStep';
import ProjectDetailsStep, { ProjectDetailsData } from './features/ProjectDetailsStep';
import PreviewStep from './features/PreviewStep';

type Step = 'category' | 'details' | 'preview';

interface FormData extends ProjectDetailsData {
  category?: string;
  subcategory?: string;
}

export default function MarketplacePage() {
  const router = useRouter();
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
    const slug =
      formData.adTitle?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") ||
      "your-listing";
    const title = formData.adTitle || "Your ad";
    router.push(
      `/marketplace/post-ad/successful?slug=${encodeURIComponent(slug)}&title=${encodeURIComponent(title)}`
    );
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

