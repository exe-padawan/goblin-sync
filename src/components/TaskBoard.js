import React, { useEffect, useState } from 'react';
import { useTask } from '../context/TaskContext';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { Calendar, CheckCircle, Clock, Target, MoreHorizontal } from 'lucide-react';

const TaskBoard = () => {
  const { tasks, completeMicroTask, loading, error, fetchTasks } = useTask();
  const [groupedTasks, setGroupedTasks] = useState({});

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Group tasks by date
    const grouped = {};
    
    tasks.forEach(task => {
      task.micro_tasks.forEach(microTask => {
        const dateKey = microTask.assigned_date;
        if (!grouped[dateKey]) {
          grouped[dateKey] = {
            date: dateKey,
            microTasks: []
          };
        }
        grouped[dateKey].microTasks.push({
          ...microTask,
          parentTaskTitle: task.title,
          parentTaskId: task.id
        });
      });
    });

    // Sort by date
    const sortedGroups = Object.keys(grouped)
      .sort((a, b) => new Date(a) - new Date(b))
      .reduce((acc, key) => {
        acc[key] = grouped[key];
        return acc;
      }, {});

    setGroupedTasks(sortedGroups);
  }, [tasks]);

  const handleCompleteTask = async (microTaskId) => {
    await completeMicroTask(microTaskId);
  };

  const getDateLabel = (dateString) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (isPast(date)) return `${format(date, 'MMM d')} (Past)`;
    
    return format(date, 'MMM d, yyyy');
  };

  const getDateColor = (dateString) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) return 'border-green-400 bg-green-50';
    if (isTomorrow(date)) return 'border-blue-400 bg-blue-50';
    if (isPast(date)) return 'border-red-400 bg-red-50';
    
    return 'border-gray-300 bg-white';
  };

  const getCompletionStats = (microTasks) => {
    const completed = microTasks.filter(mt => mt.completed).length;
    const total = microTasks.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    
    return { completed, total, percentage };
  };

  if (loading && Object.keys(groupedTasks).length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Board</h1>
        <p className="text-lg text-gray-600">
          Your micro-tasks organized by date for daily progress
        </p>
      </div>

      {/* Task Columns */}
      {Object.keys(groupedTasks).length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No tasks yet</h3>
          <p className="text-gray-500 mb-6">Create your first task to see it broken down into micro-tasks here!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(groupedTasks).map(([dateKey, group]) => {
            const stats = getCompletionStats(group.microTasks);
            
            return (
              <div
                key={dateKey}
                className={`rounded-xl border-2 ${getDateColor(dateKey)} p-6 shadow-sm`}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getDateLabel(dateKey)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(dateKey), 'EEEE')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {stats.completed}/{stats.total}
                    </div>
                    <div className="text-xs text-gray-500">completed</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.percentage}%` }}
                  ></div>
                </div>

                {/* Micro Tasks */}
                <div className="space-y-3">
                  {group.microTasks.map((microTask) => (
                    <div
                      key={microTask.id}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        microTask.completed
                          ? 'bg-green-50 border-green-200 opacity-75'
                          : 'bg-white border-gray-200 hover:border-primary-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-2">
                            <h4 className={`font-medium text-sm ${
                              microTask.completed 
                                ? 'text-green-700 line-through' 
                                : 'text-gray-900'
                            }`}>
                              {microTask.title}
                            </h4>
                          </div>
                          
                          <p className={`text-xs mb-2 ${
                            microTask.completed ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {microTask.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 truncate">
                              From: {microTask.parentTaskTitle}
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                {microTask.estimated_minutes}m
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleCompleteTask(microTask.id)}
                          disabled={microTask.completed || loading}
                          className={`ml-3 p-2 rounded-lg transition-colors ${
                            microTask.completed
                              ? 'bg-green-100 text-green-600 cursor-not-allowed'
                              : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                          }`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Date Summary */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {stats.percentage === 100 ? '✅ All complete!' : 
                       stats.completed > 0 ? '🔄 In progress' : '⏳ Not started'}
                    </span>
                    <span className="text-gray-600">
                      {group.microTasks.reduce((acc, mt) => acc + mt.estimated_minutes, 0)} min total
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;