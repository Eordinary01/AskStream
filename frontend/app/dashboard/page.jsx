// app/dashboard/page.js
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import {
  Building2,
  Plus,
  Copy,
  Loader2,
  UserPlus,
  Users,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Clock,
  UserCheck,
  Share2,
  Trophy,
  Brain,
  Award,
  Target,
  Shield
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [orgLink, setOrgLink] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [orgLoading, setOrgLoading] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(60);
  const [oneQuestionPerUser, setOneQuestionPerUser] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      fetchUserData(token);
      fetchOrganizations(token);
    }
  }, []);

  const showResponseMessage = (message, duration = 3000) => {
    setResponseMessage(message);
    setTimeout(() => setResponseMessage(""), duration);
  };

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`,
        {
          headers: { "x-auth-token": token },
        }
      );
      if (response.ok) {
        const userData = await response.json();
        console.log('Fetched user data:', userData);
        setUser(userData);
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem("token");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async (token) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/my`,
        {
          headers: { "x-auth-token": token },
        }
      );
      if (response.ok) {
        const orgs = await response.json();
        console.log('Fetched organizations:', orgs);
        setOrganizations(orgs);
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      showResponseMessage("Failed to fetch organizations", 5000);
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (
      (cooldownTime > 0 && oneQuestionPerUser) ||
      (cooldownTime === 0 && !oneQuestionPerUser)
    ) {
      showResponseMessage(
        "Please select either a cooldown time (greater than 0) OR 'one question per user', but not both.",
        5000
      );
      return;
    }

    setOrgLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            name: newOrgName,
            cooldownTime: oneQuestionPerUser ? 0 : cooldownTime * 1000,
            oneQuestionPerUser,
          }),
        }
      );
      if (response.ok) {
        const newOrg = await response.json();
        console.log('Created organization:', newOrg);
        setOrganizations((prev) => [...prev, newOrg]);
        setNewOrgName("");
        setCooldownTime(60);
        setOneQuestionPerUser(false);
        showResponseMessage("Organization created successfully");
      } else {
        throw new Error();
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      showResponseMessage("Failed to create organization", 5000);
    }
    setOrgLoading(false);
  };

  const handleJoinOrg = async (e) => {
    e.preventDefault();
    if (!orgLink.trim()) {
      showResponseMessage("Please enter a valid organization link", 5000);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      
      let url = orgLink.trim();
      if (url.includes("/org/")) {
        url = url.split("/org/")[1];
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ url }),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        showResponseMessage(data.msg);
        setOrganizations((prev) => [...prev, data.organization]);
        setOrgLink("");
        router.push(`/org/${url}`);
      } else {
        const errorData = await response.json();
        showResponseMessage(
          errorData.msg || "Failed to join organization",
          5000
        );
      }
    } catch (error) {
      console.error('Error joining organization:', error);
      showResponseMessage("An unexpected error occurred", 5000);
    }
  };

  const copyToClipboard = (text, orgId) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedLink(orgId);
        showResponseMessage("Link copied to clipboard!");
        setTimeout(() => setCopiedLink(null), 2000);
      },
      () => showResponseMessage("Failed to copy link", 5000)
    );
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
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section with Stats */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-[#E6E4FF] mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-[#6C63FF]" />
                <span className="text-sm font-medium text-[#6C63FF]">Welcome back</span>
              </div>
              <h1 className="text-4xl font-bold text-[#2D2A5A] mb-2">
                {user?.username}!
              </h1>
              <p className="text-[#7A799D]">
                {user?.isCreator
                  ? "Manage your organizations and track team performance"
                  : "Join organizations and start your expertise journey"}
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  user?.role === 'creator' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {user?.role === 'admin' && <Shield size={12} />}
                  {user?.role === 'creator' && <Sparkles size={12} />}
                  Role: {user?.role || 'user'}
                </span>
              </div>
            </div>

            {user && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#F5F4FF] rounded-xl p-3 text-center">
                  <Trophy size={20} className="text-[#6C63FF] mx-auto mb-1" />
                  <div className="text-2xl font-bold text-[#2D2A5A]">{user.points || 0}</div>
                  <div className="text-xs text-[#7A799D]">Total Points</div>
                </div>
                <div className="bg-[#F5F4FF] rounded-xl p-3 text-center">
                  <Target size={20} className="text-[#6C63FF] mx-auto mb-1" />
                  <div className="text-2xl font-bold text-[#2D2A5A]">{user.totalQuestionsAnswered || 0}</div>
                  <div className="text-xs text-[#7A799D]">Questions</div>
                </div>
                <div className="bg-[#F5F4FF] rounded-xl p-3 text-center">
                  <Award size={20} className="text-[#6C63FF] mx-auto mb-1" />
                  <div className="text-2xl font-bold text-[#2D2A5A]">{user.accuracy?.toFixed(1) || 0}%</div>
                  <div className="text-xs text-[#7A799D]">Accuracy</div>
                </div>
                <div className="bg-[#F5F4FF] rounded-xl p-3 text-center">
                  <Brain size={20} className="text-[#6C63FF] mx-auto mb-1" />
                  <div className="text-2xl font-bold text-[#2D2A5A]">{user.expertise?.length || 0}</div>
                  <div className="text-xs text-[#7A799D]">Expert Topics</div>
                </div>
              </div>
            )}
          </div>

          {user?.expertise && user.expertise.length > 0 && (
            <div className="mt-6 pt-6 border-t border-[#F0EEFF]">
              <h3 className="text-sm font-semibold text-[#2D2A5A] mb-3">Your Expertise Areas</h3>
              <div className="flex flex-wrap gap-2">
                {user.expertise.map((exp, idx) => (
                  <div key={idx} className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    exp.level === 'expert' ? 'bg-green-100 text-green-700' :
                    exp.level === 'intermediate' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {exp.topic} • {exp.level} • {exp.accuracy?.toFixed(0)}% accuracy
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {user && (
          <div className="space-y-8">
            {user.isCreator ? (
              <>
                {/* Organizations List Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-[#E6E4FF] overflow-hidden">
                  <div className="px-8 py-6 border-b border-[#F0EEFF] bg-gradient-to-r from-[#F5F4FF] to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F4FF] rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#6C63FF]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-[#2D2A5A]">Your Organizations</h2>
                        <p className="text-sm text-[#7A799D] mt-0.5">Manage and track your team's learning progress</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    {organizations.length === 0 ? (
                      <div className="text-center py-12 bg-[#F5F4FF] rounded-xl">
                        <Building2 className="w-12 h-12 text-[#6C63FF]/30 mx-auto mb-4" />
                        <p className="text-[#7A799D] font-medium mb-2">No organizations yet</p>
                        <p className="text-sm text-[#7A799D]">Create your first organization below</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {organizations.map((org) => (
                          <div
                            key={org._id}
                            className="group bg-[#F5F4FF] hover:bg-[#F0EFFF] rounded-xl p-6 transition-all duration-300 border border-transparent hover:border-[#E6E4FF]"
                          >
                            <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                  <span className="text-[#6C63FF] font-semibold text-lg">
                                    {org.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-semibold text-lg text-[#2D2A5A]">{org.name}</span>
                                  <div className="flex items-center gap-3 mt-1">
                                    {org.oneQuestionPerUser ? (
                                      <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                        <UserCheck size={12} />
                                        One question per user
                                      </span>
                                    ) : org.cooldownTime > 0 && (
                                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                        <Clock size={12} />
                                        {org.cooldownTime / 1000}s cooldown
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Link
                                href={`/org/${org.url}`}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#6C63FF] rounded-lg hover:bg-[#6C63FF] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                              >
                                <Users className="w-4 h-4" />
                                Manage Organization
                                <ArrowRight size={14} />
                              </Link>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-[#E6E4FF]">
                              <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-2 text-[#7A799D]">
                                  <Share2 className="w-4 h-4" />
                                  <span className="text-sm">Invite link:</span>
                                  <code className="text-sm bg-[#F5F4FF] px-3 py-1.5 rounded-lg font-mono">
                                    /org/{org.url}
                                  </code>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(`/org/${org.url}`, org._id)}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6C63FF] to-[#9C8FFF] text-white rounded-lg hover:from-[#5550E8] hover:to-[#8A7FEE] transition-all duration-300 text-sm font-medium"
                                >
                                  {copiedLink === org._id ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4" />
                                      Copy Link
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Create Organization Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-[#E6E4FF] overflow-hidden">
                  <div className="px-8 py-6 border-b border-[#F0EEFF] bg-gradient-to-r from-[#F5F4FF] to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F4FF] rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-[#6C63FF]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-[#2D2A5A]">Create New Organization</h2>
                        <p className="text-sm text-[#7A799D] mt-0.5">Set up a learning space for your team or community</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleCreateOrg} className="p-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-[#2D2A5A] mb-2">Organization Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Tech Academy, Design Masters"
                          value={newOrgName}
                          onChange={(e) => setNewOrgName(e.target.value)}
                          className="w-full px-4 py-3 bg-[#F5F4FF] border border-[#E6E4FF] rounded-xl focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all duration-300 text-[#2D2A5A] placeholder:text-[#7A799D]"
                          required
                          disabled={orgLoading}
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-[#F5F4FF] rounded-xl border border-[#E6E4FF]">
                          <input
                            type="checkbox"
                            id="oneQuestionPerUser"
                            checked={oneQuestionPerUser}
                            onChange={(e) => {
                              setOneQuestionPerUser(e.target.checked);
                              if (e.target.checked) setCooldownTime(0);
                            }}
                            className="w-5 h-5 text-[#6C63FF] rounded focus:ring-[#6C63FF]"
                            disabled={orgLoading}
                          />
                          <label htmlFor="oneQuestionPerUser" className="flex-1 cursor-pointer">
                            <span className="font-medium text-[#2D2A5A]">One question per user</span>
                            <p className="text-sm text-[#7A799D] mt-0.5">Each member can answer only one question total</p>
                          </label>
                        </div>

                        <div className="p-4 bg-[#F5F4FF] rounded-xl border border-[#E6E4FF]">
                          <label className="block text-sm font-medium text-[#2D2A5A] mb-2">Cooldown Period</label>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="0"
                              value={cooldownTime}
                              onChange={(e) => {
                                setCooldownTime(Number(e.target.value));
                                if (Number(e.target.value) > 0) setOneQuestionPerUser(false);
                              }}
                              className="w-32 px-4 py-3 bg-white border border-[#E6E4FF] rounded-xl focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all duration-300 text-[#2D2A5A]"
                              disabled={oneQuestionPerUser || orgLoading}
                            />
                            <span className="text-[#7A799D]">seconds between questions</span>
                          </div>
                          <p className="text-xs text-[#7A799D] mt-2">Members must wait this long before answering another question</p>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6C63FF] to-[#9C8FFF] text-white rounded-xl font-medium shadow-lg shadow-purple-200 hover:from-[#5550E8] hover:to-[#8A7FEE] hover:shadow-xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!newOrgName.trim() || orgLoading}
                      >
                        {orgLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Create Organization
                      </button>
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <>
                {/* Join Organization Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-[#E6E4FF] overflow-hidden">
                  <div className="px-8 py-6 border-b border-[#F0EEFF] bg-gradient-to-r from-[#F5F4FF] to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F4FF] rounded-lg flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-[#6C63FF]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-[#2D2A5A]">Join an Organization</h2>
                        <p className="text-sm text-[#7A799D] mt-0.5">Enter an invite link to join and start learning</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleJoinOrg} className="p-8">
                    <div className="flex gap-4">
                      <input
                        type="text"
                        placeholder="Paste organization invite link"
                        value={orgLink}
                        onChange={(e) => setOrgLink(e.target.value)}
                        className="flex-1 px-4 py-3 bg-[#F5F4FF] border border-[#E6E4FF] rounded-xl focus:outline-none focus:border-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/20 transition-all duration-300 text-[#2D2A5A] placeholder:text-[#7A799D]"
                        required
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6C63FF] to-[#9C8FFF] text-white rounded-xl font-medium shadow-lg shadow-purple-200 hover:from-[#5550E8] hover:to-[#8A7FEE] hover:shadow-xl transition-all duration-300"
                      >
                        <UserPlus className="w-5 h-5" />
                        Join
                      </button>
                    </div>
                  </form>
                </div>

                {/* Joined Organizations Section */}
                <div className="bg-white rounded-2xl shadow-xl border border-[#E6E4FF] overflow-hidden">
                  <div className="px-8 py-6 border-b border-[#F0EEFF] bg-gradient-to-r from-[#F5F4FF] to-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F4FF] rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-[#6C63FF]" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-[#2D2A5A]">Your Learning Communities</h2>
                        <p className="text-sm text-[#7A799D] mt-0.5">Organizations you're a member of</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    {organizations.length === 0 ? (
                      <div className="text-center py-12 bg-[#F5F4FF] rounded-xl">
                        <Users className="w-12 h-12 text-[#6C63FF]/30 mx-auto mb-4" />
                        <p className="text-[#7A799D] font-medium mb-2">No organizations joined yet</p>
                        <p className="text-sm text-[#7A799D]">Join an organization using the form above</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {organizations.map((org) => (
                          <div
                            key={org._id}
                            className="flex items-center justify-between bg-[#F5F4FF] hover:bg-[#F0EFFF] p-6 rounded-xl transition-all duration-300 flex-wrap gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                <span className="text-[#6C63FF] font-semibold text-lg">
                                  {org.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-[#2D2A5A] text-lg">{org.name}</span>
                                {org.oneQuestionPerUser ? (
                                  <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full ml-3">
                                    <UserCheck size={12} />
                                    One question per user
                                  </span>
                                ) : org.cooldownTime > 0 && (
                                  <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full ml-3">
                                    <Clock size={12} />
                                    {org.cooldownTime / 1000}s cooldown
                                  </span>
                                )}
                              </div>
                            </div>
                            <Link
                              href={`/org/${org.url}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#6C63FF] rounded-lg hover:bg-[#6C63FF] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                              Start Learning
                              <ArrowRight size={14} />
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

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