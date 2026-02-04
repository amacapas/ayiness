import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import KanbanBoard from '../components/KanbanBoard';
import { getUserApplications, addApplication } from '../services/firebase';
import { Application, ColumnId } from '../types';
import { Plus } from 'lucide-react';

interface DashboardProps {
  user: User | null;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New Job State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchApps = async () => {
      try {
        const data = await getUserApplications(user.uid);
        setApps(data);
      } catch (error) {
        console.error("Error fetching apps", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [user, navigate]);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newJobTitle || !newCompany) return;

    const newApp = {
        title: newJobTitle,
        company: newCompany,
        status: 'Saved' as ColumnId,
        location: 'Remote',
        createdAt: Date.now()
    };

    try {
        const added = await addApplication(user.uid, newApp);
        if (added) {
            setApps(prev => [...prev, added]);
            setShowAddModal(false);
            setNewJobTitle('');
            setNewCompany('');
        }
    } catch (e) {
        console.error("Add failed", e);
    }
  };

  if (!user) return null;

  const stats = {
      total: apps.length,
      applied: apps.filter(a => a.status === 'Applied').length,
      interviewing: apps.filter(a => a.status === 'Interviewing').length,
      offers: apps.filter(a => a.status === 'Offer').length
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col px-6 py-6 overflow-hidden">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
            <h1 className="text-2xl font-bold text-gh-text">Application Board</h1>
            <p className="text-gh-muted text-sm mt-1">Manage your job search pipeline.</p>
        </div>

        <div className="flex items-center gap-4">
            <div className="hidden md:flex gap-4 text-sm">
                <div className="px-3 py-1 rounded-full bg-gh-card border border-gh-border text-gh-muted">
                    <span className="text-gh-text font-bold mr-1">{stats.total}</span> Total
                </div>
                <div className="px-3 py-1 rounded-full bg-gh-card border border-gh-border text-gh-muted">
                    <span className="text-blue-400 font-bold mr-1">{stats.interviewing}</span> Interviewing
                </div>
                 <div className="px-3 py-1 rounded-full bg-gh-card border border-gh-border text-gh-muted">
                    <span className="text-purple-400 font-bold mr-1">{stats.offers}</span> Offers
                </div>
            </div>
            
            <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-gh-green hover:bg-gh-greenHover text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors text-sm"
            >
                <Plus size={16} />
                New Application
            </button>
        </div>
      </div>

      {/* Board Area */}
      <div className="flex-1 min-h-0">
        {loading ? (
            <div className="flex items-center justify-center h-full text-gh-muted">Loading board...</div>
        ) : (
            <KanbanBoard initialApps={apps} user={user} />
        )}
      </div>

      {/* Simple Add Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-gh-card border border-gh-border rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-lg font-semibold mb-4 text-gh-text">Add Job Application</h3>
                <form onSubmit={handleAddJob} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-gh-muted">Job Title</label>
                        <input 
                            value={newJobTitle}
                            onChange={(e) => setNewJobTitle(e.target.value)}
                            className="w-full bg-gh-bg border border-gh-border rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-gh-blue outline-none" 
                            placeholder="e.g. Senior Frontend Engineer"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gh-muted">Company</label>
                        <input 
                            value={newCompany}
                            onChange={(e) => setNewCompany(e.target.value)}
                            className="w-full bg-gh-bg border border-gh-border rounded-md px-3 py-2 text-sm mt-1 focus:ring-2 focus:ring-gh-blue outline-none" 
                            placeholder="e.g. Google"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button 
                            type="button" 
                            onClick={() => setShowAddModal(false)}
                            className="px-4 py-2 text-sm font-medium text-gh-muted hover:text-gh-text transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 text-sm font-medium bg-gh-green hover:bg-gh-greenHover text-white rounded-md"
                        >
                            Add Job
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
