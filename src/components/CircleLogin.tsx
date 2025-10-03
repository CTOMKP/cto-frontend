"use client";

import React, { useState } from 'react';
import { useCircleAuth } from '@/hooks/useCircleAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CircleLoginProps {
  onLoginSuccess?: () => void;
}

export default function CircleLogin({ onLoginSuccess }: CircleLoginProps) {
  const { login, register, isLoading, error, clearError } = useCircleAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (isRegisterMode) {
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      try {
        await register(formData.userId, formData.email, formData.password);
        onLoginSuccess?.();
      } catch (error) {
        console.error('Registration failed:', error);
      }
    } else {
      try {
        await login(formData.email, formData.password);
        onLoginSuccess?.();
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-[#010101] border border-white/20 rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-white">
        {isRegisterMode ? 'Create Account' : 'Login'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegisterMode && (
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-white/70 mb-2">
              User ID
            </label>
            <Input
              id="userId"
              name="userId"
              type="text"
              value={formData.userId}
              onChange={handleInputChange}
              placeholder="Enter your user ID"
              className="bg-white/5 border-white/20 text-white"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className="bg-white/5 border-white/20 text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            className="bg-white/5 border-white/20 text-white"
            required
          />
        </div>

        {isRegisterMode && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/70 mb-2">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className="bg-white/5 border-white/20 text-white"
              required
            />
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-[#FF0075] via-[#FF4A15] to-[#FFCB45] rounded-lg h-10"
        >
          {isLoading ? 'Loading...' : (isRegisterMode ? 'Create Account' : 'Login')}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            setIsRegisterMode(!isRegisterMode);
            setFormData({ userId: '', email: '', password: '', confirmPassword: '' });
            clearError();
          }}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          {isRegisterMode 
            ? 'Already have an account? Login' 
            : "Don't have an account? Create one"
          }
        </button>
      </div>
    </div>
  );
}


