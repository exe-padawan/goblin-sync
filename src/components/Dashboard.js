import React, { useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import { CheckCircle, Clock, Target, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { 
    dashboardData, 
    todaysMicroTasks, 
    completeMicroTask, 
    loading, 
    error,
    fetchDashboardData,
    fetchTodaysMicroTasks 
  } = useTask();

  useEffect(() => {
    fetchDashboardData();
    fetchTodaysMicroTasks();
  }, []);

  const handleCompleteTask = async (microTaskId) => {
    await completeMicroTask(microTaskId);
  };

  if (loading && todaysMicroTasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome to GobSync
        </h1>
        <p className="text-lg text-gray-600">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Track your daily 1% improvement journey
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center">
            <div className="gradient-primary p-3 rounded-lg">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.total_tasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center">
            <div className="gradient-success p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.completed_tasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Micro-Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.todays_micro_tasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center">
            <div className="gradient-warning p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Today's Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(dashboardData.progress_percentage)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Daily Progress</h3>
          <span className="text-sm text-gray-500">
            {dashboardData.completed_today} of {dashboardData.todays_micro_tasks} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="gradient-success h-3 rounded-full transition-all duration-500"
            style={{ width: `${dashboardData.progress_percentage}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          {dashboardData.progress_percentage === 100 
            ? "🎉 Congratulations! You've completed all your micro-tasks for today!" 
            : `Keep going! ${100 - Math.round(dashboardData.progress_percentage)}% to go for your daily goal.`
          }
        </p>
      </div>

      {/* Today's Micro-Tasks */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center mb-6">
          <Calendar className="h-5 w-5 text-primary-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Today's Micro-Tasks</h3>
        </div>

        {todaysMicroTasks.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No micro-tasks for today</h4>
            <p className="text-gray-500 mb-4">Create a new task to get started with your daily 1% improvement!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todaysMicroTasks.map((microTask) => (
              <div
                key={microTask.id}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  microTask.completed
                    ? 'bg-green-50 border-green-200 opacity-75'
                    : 'bg-gray-50 border-gray-200 hover:border-primary-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h4 className={`font-medium ${
                        microTask.completed ? 'text-green-700 line-through' : 'text-gray-900'
                      }`}>
                        {microTask.title}
                      </h4>
                      <span className="ml-3 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                        {microTask.estimated_minutes} min
                      </span>
                    </div>
                    <p className={`text-sm ${
                      microTask.completed ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {microTask.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      From: {microTask.parent_task_title}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCompleteTask(microTask.id)}
                    disabled={microTask.completed || loading}
                    className={`ml-4 p-2 rounded-lg transition-colors ${
                      microTask.completed
                        ? 'bg-green-100 text-green-600 cursor-not-allowed'
                        : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                    }`}
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;