import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTask } from '../context/TaskContext';
import { Brain, Target, ArrowRight, Loader } from 'lucide-react';

const CreateTask = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const { createTask, loading, error } = useTask();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    setIsSubmitting(true);
    
    try {
      await createTask({
        title: title.trim(),
        description: description.trim()
      });
      
      // Success - navigate to dashboard or board
      navigate('/');
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePreview = () => {
    if (!title.trim()) return;
    setShowPreview(!showPreview);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="gradient-primary p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Task</h1>
        <p className="text-lg text-gray-600">
          Let AI break down your goal into manageable micro-tasks
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to accomplish?
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Learn to play guitar, Write a blog post, Organize my closet..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Additional details (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any specific requirements, deadlines, or context that might help with the breakdown..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* AI Preview Section */}
          {title.trim() && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Target className="h-5 w-5 text-primary-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">AI Breakdown Preview</h3>
                </div>
                <button
                  type="button"
                  onClick={generatePreview}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>

              {showPreview && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <Brain className="h-4 w-4 mr-2" />
                    AI will break this down into 3-7 micro-tasks, each taking 15-30 minutes
                  </div>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded border-l-4 border-primary-200">
                      <div className="font-medium text-sm text-gray-900">Example micro-task 1</div>
                      <div className="text-xs text-gray-600">Research and planning phase</div>
                    </div>
                    <div className="bg-white p-3 rounded border-l-4 border-primary-200">
                      <div className="font-medium text-sm text-gray-900">Example micro-task 2</div>
                      <div className="text-xs text-gray-600">First action step</div>
                    </div>
                    <div className="bg-white p-3 rounded border-l-4 border-primary-200">
                      <div className="font-medium text-sm text-gray-900">...</div>
                      <div className="text-xs text-gray-600">Additional steps as needed</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={!title.trim() || isSubmitting || loading}
              className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting || loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Creating & Breaking Down...
                </>
              ) : (
                <>
                  Create Task
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-primary-600 font-medium text-sm mb-1">🧠 Smart Breakdown</div>
          <div className="text-gray-600 text-xs">AI analyzes your task and creates actionable steps</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-primary-600 font-medium text-sm mb-1">⏱️ Time-Boxed</div>
          <div className="text-gray-600 text-xs">Each micro-task is designed for 15-30 minutes</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-primary-600 font-medium text-sm mb-1">📈 Daily Progress</div>
          <div className="text-gray-600 text-xs">Track your 1% improvement every day</div>
        </div>
      </div>
    </div>
  );
};

export default CreateTask;