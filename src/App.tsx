import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, AlertCircle, Flag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase, Todo, Priority } from './lib/supabase';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '', priority: 'medium' as Priority });
  const [loading, setLoading] = useState(true);
  const confettiTriggered = useRef(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    const completedCount = todos.filter(todo => todo.completed).length;
    const percentage = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

    if (percentage === 100 && todos.length > 0 && !confettiTriggered.current) {
      confettiTriggered.current = true;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setTimeout(() => {
        confettiTriggered.current = false;
      }, 2000);
    }
  }, [todos]);

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([{
          task: formData.title.trim(),
          description: formData.description.trim() || null,
          deadline: formData.deadline || null,
          priority: formData.priority,
          completed: false
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTodos([data, ...todos]);
        setFormData({ title: '', description: '', deadline: '', priority: 'medium' });
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('todos')
        .update({ completed: !completed })
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTodos(todos.filter(todo => todo.id !== id));
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const getSortedTodos = () => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const notCompleted = todos.filter(t => !t.completed);
    const completed = todos.filter(t => t.completed);

    notCompleted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    return [...notCompleted, ...completed];
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const percentage = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;
  const sortedTodos = getSortedTodos();

  const getPriorityStyles = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return { badge: 'bg-red-900 text-red-200', indicator: 'text-red-500', label: 'High' };
      case 'medium':
        return { badge: 'bg-amber-900 text-amber-200', indicator: 'text-amber-500', label: 'Medium' };
      case 'low':
        return { badge: 'bg-yellow-900 text-yellow-200', indicator: 'text-yellow-500', label: 'Low' };
    }
  };

  const formatDeadline = (deadline?: string) => {
    if (!deadline) return null;
    return new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 border-b border-slate-700">
            <h1 className="text-4xl font-bold text-slate-50 mb-4">Focus Tasks</h1>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Progress</span>
                <span className={`font-semibold ${percentage === 100 && todos.length > 0 ? 'text-green-400' : 'text-slate-300'}`}>
                  {completedCount} of {todos.length}
                </span>
              </div>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                <div
                  className={`h-full transition-all duration-500 ${
                    percentage === 100 && todos.length > 0
                      ? 'bg-gradient-to-r from-green-500 to-green-600'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={addTodo} className="mb-8 space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Task Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="What needs to be done?"
                  className="w-full px-4 py-3 bg-slate-700 text-slate-50 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 transition"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any notes or details..."
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-700 text-slate-50 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Deadline (Optional)</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-700 text-slate-50 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    className="w-full px-4 py-3 bg-slate-700 text-slate-50 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                Add Task
              </button>
            </form>

            {loading ? (
              <div className="text-center py-12 text-slate-400">
                Loading tasks...
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <AlertCircle size={40} className="mx-auto mb-3 opacity-50" />
                <p className="text-lg">No tasks yet!</p>
                <p className="text-sm mt-2">Create your first task to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedTodos.map((todo) => {
                  const priorityStyle = getPriorityStyles(todo.priority);
                  return (
                    <div
                      key={todo.id}
                      className={`group p-4 rounded-lg border transition-all duration-200 ${
                        todo.completed
                          ? 'bg-slate-800 border-slate-700'
                          : 'bg-slate-800 border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTodo(todo.id, todo.completed)}
                          className="flex-shrink-0 mt-1 text-slate-400 hover:text-blue-500 transition-colors duration-200"
                        >
                          {todo.completed ? (
                            <CheckCircle2 size={24} className="text-green-500" />
                          ) : (
                            <Circle size={24} />
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`flex-1 text-base font-medium transition-all duration-200 ${
                                todo.completed
                                  ? 'text-slate-500 line-through'
                                  : 'text-slate-100'
                              }`}
                            >
                              {todo.task}
                            </span>
                            <Flag size={16} className={`flex-shrink-0 ${priorityStyle.indicator}`} />
                            <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${priorityStyle.badge}`}>
                              {priorityStyle.label}
                            </span>
                          </div>

                          {todo.description && (
                            <p className={`text-sm mb-2 ${todo.completed ? 'text-slate-600' : 'text-slate-400'}`}>
                              {todo.description}
                            </p>
                          )}

                          {todo.deadline && (
                            <p className={`text-xs ${todo.completed ? 'text-slate-600' : 'text-slate-500'}`}>
                              Due: {formatDeadline(todo.deadline)}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => deleteTodo(todo.id)}
                          className="flex-shrink-0 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 mt-1"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-slate-500 text-sm">
          Complete all tasks to see the celebration
        </div>
      </div>
    </div>
  );
}

export default App;
