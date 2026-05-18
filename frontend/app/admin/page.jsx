// app/admin/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import {
  Loader2,
  Users,
  Building2,
  Brain,
  Trophy,
  BarChart3,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  UserCog,
  Activity,
  TrendingUp,
  Calendar,
  Mail,
  Zap
} from 'lucide-react';

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      // Fetch current user
      const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`, {
        headers: { 'x-auth-token': token }
      });
      const userData = await userRes.json();
      
      // Check if user is admin
      if (userData.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      setUser(userData);
      
      // Fetch all data
      await Promise.all([
        fetchOrganizations(token),
        fetchAllUsers(token),
        fetchStats(token)
      ]);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async (token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizations`, {
        headers: { 'x-auth-token': token }
      });
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const fetchAllUsers = async (token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: { 'x-auth-token': token }
      });
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async (token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats`, {
        headers: { 'x-auth-token': token }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteOrganization = async (orgId) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/organizations/${orgId}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      
      if (response.ok) {
        showResponseMessage('Organization deleted successfully');
        fetchOrganizations(token);
      } else {
        showResponseMessage('Failed to delete organization', 5000);
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      showResponseMessage('Error deleting organization', 5000);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        showResponseMessage(`User role updated to ${newRole}`);
        fetchAllUsers(token);
      } else {
        showResponseMessage('Failed to update user role', 5000);
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      showResponseMessage('Error updating user role', 5000);
    }
  };

  const showResponseMessage = (message, duration = 3000) => {
    setResponseMessage(message);
    setTimeout(() => setResponseMessage(''), duration);
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'creator': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0EFFF] via-white to-[#EEF2FF] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#6C63FF] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0EFFF] via-white to-[#EEF2FF]">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Admin Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#E6E4FF] mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={20} className="text-[#6C63FF]" />
                <span className="text-sm font-medium text-[#6C63FF]">Admin Panel</span>
              </div>
              <h1 className="text-4xl font-bold text-[#2D2A5A] mb-2">
                Welcome, {user?.username}
              </h1>
              <p className="text-[#7A799D]">
                Manage users, organizations, and monitor platform activity
              </p>
            </div>
            <div className="bg-[#F5F4FF] rounded-xl p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#6C63FF]">{stats?.totalUsers || 0}</div>
                <div className="text-xs text-[#7A799D]">Total Users</div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="flex gap-2 mb-8 border-b border-[#E6E4FF] overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'text-[#6C63FF] border-b-2 border-[#6C63FF]'
                : 'text-[#7A799D] hover:text-[#6C63FF]'
            }`}
          >
            <BarChart3 size={16} className="inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('organizations')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'organizations'
                ? 'text-[#6C63FF] border-b-2 border-[#6C63FF]'
                : 'text-[#7A799D] hover:text-[#6C63FF]'
            }`}
          >
            <Building2 size={16} className="inline mr-2" />
            Organizations
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 text-sm font-medium transition-all duration-300 whitespace-nowrap ${
              activeTab === 'users'
                ? 'text-[#6C63FF] border-b-2 border-[#6C63FF]'
                : 'text-[#7A799D] hover:text-[#6C63FF]'
            }`}
          >
            <Users size={16} className="inline mr-2" />
            Users
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-[#E6E4FF]">
                <div className="flex items-center justify-between mb-4">
                  <Users size={24} className="text-[#6C63FF]" />
                  <TrendingUp size={20} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-[#2D2A5A]">{stats.totalUsers}</h3>
                <p className="text-sm text-[#7A799D] mt-1">Total Users</p>
                <div className="mt-4 pt-4 border-t border-[#F0EEFF]">
                  <div className="flex justify-between text-xs">
                    <span>Creators: {stats.totalCreators}</span>
                    <span>Admins: {stats.totalAdmins}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E6E4FF]">
                <div className="flex items-center justify-between mb-4">
                  <Building2 size={24} className="text-[#6C63FF]" />
                  <Activity size={20} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-[#2D2A5A]">{stats.totalOrganizations}</h3>
                <p className="text-sm text-[#7A799D] mt-1">Total Organizations</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E6E4FF]">
                <div className="flex items-center justify-between mb-4">
                  <Brain size={24} className="text-[#6C63FF]" />
                  <Zap size={20} className="text-yellow-500" />
                </div>
                <h3 className="text-2xl font-bold text-[#2D2A5A]">{stats.totalQuestions}</h3>
                <p className="text-sm text-[#7A799D] mt-1">Total Questions</p>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#E6E4FF]">
                <div className="flex items-center justify-between mb-4">
                  <Trophy size={24} className="text-[#6C63FF]" />
                  <CheckCircle size={20} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-[#2D2A5A]">{stats.totalAnswers}</h3>
                <p className="text-sm text-[#7A799D] mt-1">Total Answers</p>
              </div>
            </div>

            {/* Recent Activity - Top Organizations */}
            <div className="bg-white rounded-2xl border border-[#E6E4FF] overflow-hidden">
              <div className="p-6 border-b border-[#F0EEFF] bg-gradient-to-r from-[#F5F4FF] to-white">
                <h2 className="text-xl font-semibold text-[#2D2A5A]">Top Organizations</h2>
              </div>
              <div className="divide-y divide-[#F0EEFF]">
                {organizations.slice(0, 5).map((org) => (
                  <div key={org._id} className="p-6 flex items-center justify-between hover:bg-[#F5F4FF] transition-colors">
                    <div>
                      <p className="font-semibold text-[#2D2A5A]">{org.name}</p>
                      <p className="text-sm text-[#7A799D] mt-1">
                        Owner: {org.owner?.username || 'Unknown'} • Members: {org.members?.length || 0}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedOrg(org);
                        setActiveTab('organizations');
                      }}
                      className="text-[#6C63FF] hover:text-[#5550E8] transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div className="bg-white rounded-2xl border border-[#E6E4FF] overflow-hidden">
            <div className="p-6 border-b border-[#F0EEFF] bg-gradient-to-r from-[#F5F4FF] to-white">
              <h2 className="text-xl font-semibold text-[#2D2A5A]">All Organizations</h2>
            </div>
            <div className="divide-y divide-[#F0EEFF]">
              {organizations.map((org) => (
                <div key={org._id} className="p-6 hover:bg-[#F5F4FF] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-[#2D2A5A]">{org.name}</h3>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          {org.uniqueUrl}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-[#7A799D]">
                          <Users size={14} />
                          <span>Owner: {org.owner?.username || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#7A799D]">
                          <Users size={14} />
                          <span>Members: {org.members?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#7A799D]">
                          <Brain size={14} />
                          <span>Questions: {org.questions?.length || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#7A799D]">
                          <Calendar size={14} />
                          <span>Created: {new Date(org.createdAt).toLocaleDateString()}</span>
                        </div>
                        {org.oneQuestionPerUser ? (
                          <div className="flex items-center gap-2 text-sm text-purple-600">
                            <AlertTriangle size={14} />
                            <span>One question per user</span>
                          </div>
                        ) : org.cooldownTime > 0 && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Clock size={14} />
                            <span>{org.cooldownTime / 1000}s cooldown</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteOrganization(org._id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Organization"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-[#E6E4FF] overflow-hidden">
            <div className="p-6 border-b border-[#F0EEFF] bg-gradient-to-r from-[#F5F4FF] to-white">
              <h2 className="text-xl font-semibold text-[#2D2A5A]">All Users</h2>
            </div>
            <div className="divide-y divide-[#F0EEFF]">
              {allUsers.map((userItem) => (
                <div key={userItem._id} className="p-6 hover:bg-[#F5F4FF] transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg text-[#2D2A5A]">{userItem.username}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(userItem.role)}`}>
                          {userItem.role}
                        </span>
                        {userItem.isCreator && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            Creator
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm text-[#7A799D]">
                          <Mail size={14} />
                          <span>{userItem.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#7A799D]">
                          <Trophy size={14} />
                          <span>Points: {userItem.points || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#7A799D]">
                          <Target size={14} />
                          <span>Accuracy: {userItem.accuracy?.toFixed(1) || 0}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#7A799D]">
                          <Brain size={14} />
                          <span>Questions: {userItem.totalQuestionsAnswered || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#7A799D]">
                          <Calendar size={14} />
                          <span>Joined: {new Date(userItem.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      {/* Expertise Areas */}
                      {userItem.expertise && userItem.expertise.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#F0EEFF]">
                          <p className="text-xs font-medium text-[#7A799D] mb-2">Expertise Areas:</p>
                          <div className="flex flex-wrap gap-2">
                            {userItem.expertise.map((exp, idx) => (
                              <span key={idx} className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">
                                {exp.topic}: {exp.level} ({exp.accuracy?.toFixed(0)}%)
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {userItem.role !== 'admin' && (
                        <select
                          onChange={(e) => handleUpdateUserRole(userItem._id, e.target.value)}
                          value={userItem.role}
                          className="px-3 py-2 text-sm border border-[#E6E4FF] rounded-lg focus:outline-none focus:border-[#6C63FF] bg-white"
                        >
                          <option value="user">User</option>
                          <option value="creator">Creator</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toast Message */}
        {responseMessage && (
          <div className="fixed bottom-8 right-8 animate-in slide-in-from-bottom-5 fade-in duration-300 z-50">
            <div className="bg-white px-6 py-4 rounded-xl shadow-lg border-l-4 border-[#6C63FF]">
              <p className="text-[#2D2A5A]">{responseMessage}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}