// app/org/[url]/page.js
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "../../components/Header";
import {
  Loader2,
  Brain,
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Users,
  Sparkles,
  AlertTriangle,
  Building2,
  Plus,
  Clock,
  Send,
  MessageSquare,
  ThumbsUp,
  Reply,
  Timer,
  Eye,
  EyeOff,
  Lock,
  Globe,
  BarChart3,
} from "lucide-react";

// ─── small helpers ────────────────────────────────────────────────────────────

function Badge({ color = "gray", children }) {
  const map = {
    green: "bg-green-100  text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100    text-red-700",
    blue: "bg-blue-100   text-blue-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
    indigo: "bg-[#F5F4FF]  text-[#6C63FF]",
    gray: "bg-gray-100   text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${map[color]}`}
    >
      {children}
    </span>
  );
}

function Avatar({ name = "?", size = 8 }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full bg-gradient-to-br from-[#6C63FF] to-[#9C8FFF] flex items-center justify-center text-white text-xs font-bold shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center border border-[#E6E4FF]">
      <Icon size={48} className="text-[#6C63FF]/20 mx-auto mb-4" />
      <p className="font-semibold text-[#2D2A5A] mb-1">{title}</p>
      <p className="text-sm text-[#7A799D] mb-4">{subtitle}</p>
      {action}
    </div>
  );
}

// ─── countdown hook ───────────────────────────────────────────────────────────

function useCountdown(expiresAt) {
  const [secs, setSecs] = useState(null);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(expiresAt) - Date.now()) / 1000),
      );
      setSecs(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return secs;
}

function QuizCountdown({ expiresAt }) {
  const secs = useCountdown(expiresAt);
  if (secs === null) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const label = h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
  const urgent = secs < 60;
  return (
    <Badge color={urgent ? "red" : "orange"}>
      <Timer size={10} />
      {secs === 0 ? "Expired" : `Closes in ${label}`}
    </Badge>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export default function OrganizationPage() {
  const { url } = useParams();
  const router = useRouter();

  const [org, setOrg] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("discussions");

  // quiz answering
  const [answering, setAnswering] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [cooldowns, setCooldowns] = useState({}); // { qId: secsLeft }
  const cooldownRefs = useRef({});

  // leaderboard
  const [leaderboard, setLeaderboard] = useState([]);

  // ml topics
  const [mlTopics, setMlTopics] = useState([]);

  // modals
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showMLModal, setShowMLModal] = useState(false);
  const [showAddDiscussion, setShowAddDiscussion] = useState(false);

  // generating
  const [generating, setGenerating] = useState(false);
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [addingDiscussion, setAddingDiscussion] = useState(false);

  // reply state — per-discussion
  const [replyOpen, setReplyOpen] = useState(null); // discussionId
  const [replyText, setReplyText] = useState("");
  const [replyingSending, setReplyingSending] = useState(false);

  // forms
  const [qForm, setQForm] = useState({
    text: "",
    type: "quiz",
    topic: "",
    difficulty: "medium",
    points: 10,
    correctAnswer: "",
    expiresInHours: 24,
    options: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ],
  });

  const [dForm, setDForm] = useState({
    title: "",
    content: "",
    tags: "",
    allowReplies: true,
  });

  const [mlConfig, setMlConfig] = useState({
    topic: "",
    difficulty: "medium",
    count: 5,
  });

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const [uRes, oRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`, {
          headers: { "x-auth-token": token },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${url}`),
      ]);

      if (!uRes.ok) throw new Error("auth");
      if (!oRes.ok) {
        setError(
          oRes.status === 404 ? "Organization not found" : "Failed to load",
        );
        return;
      }

      const [userData, orgData] = await Promise.all([uRes.json(), oRes.json()]);
      setUser(userData);
      setOrg(orgData);

      const owner = orgData.owner?._id?.toString() ?? orgData.owner?.toString();
      const isOwnerNow =
        userData.isCreator && owner === userData._id?.toString();

      // questions
      const qUrl = isOwnerNow
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${orgData._id}/owner-questions`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${orgData._id}/active-questions`;
      const [qRes, dRes, lRes] = await Promise.all([
        fetch(qUrl, { headers: { "x-auth-token": token } }),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/discussions/${orgData._id}/discussions`,
          { headers: { "x-auth-token": token } },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${orgData._id}/leaderboard`,
        ),
      ]);

      if (qRes.ok) setQuestions(await qRes.json());
      if (dRes.ok) setDiscussions(await dRes.json());
      else setDiscussions([]);
      if (lRes.ok) setLeaderboard(await lRes.json());

      if (isOwnerNow) {
        const tRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/ml/available`,
          { headers: { "x-auth-token": token } },
        );
        if (tRes.ok) {
          const t = await tRes.json();
          setMlTopics(t.topics || []);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (url) fetchData();
  }, [url]);

  // ── derived ────────────────────────────────────────────────────────────────

  const ownerId = org?.owner?._id?.toString() ?? org?.owner?.toString();
  const isOwner =
    !!user && !!org && user.isCreator && ownerId === user._id?.toString();
  const cooldown = org?.cooldownTime ?? 0; // ms
  const onePerUser = org?.oneQuestionPerUser ?? false;
  const userAnsweredAny = questions.some((q) => q.answered);

  // ── cooldown timer ─────────────────────────────────────────────────────────

  const startCooldown = (qId, seconds) => {
    if (!seconds || seconds <= 0) return;
    setCooldowns((p) => ({ ...p, [qId]: seconds }));
    if (cooldownRefs.current[qId]) clearInterval(cooldownRefs.current[qId]);
    cooldownRefs.current[qId] = setInterval(() => {
      setCooldowns((p) => {
        const rem = (p[qId] || 0) - 1;
        if (rem <= 0) {
          clearInterval(cooldownRefs.current[qId]);
          const n = { ...p };
          delete n[qId];
          return n;
        }
        return { ...p, [qId]: rem };
      });
    }, 1000);
  };

  useEffect(
    () => () => Object.values(cooldownRefs.current).forEach(clearInterval),
    [],
  );

  // ── answer ─────────────────────────────────────────────────────────────────

  const handleAnswer = async (qId, answer) => {
    if (answering || cooldowns[qId]) return;
    setAnswering(qId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${org._id}/questions/${qId}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ answer }),
        },
      );
      const result = await res.json();
      setLastResult({ ...result, qId });
      setTimeout(() => setLastResult(null), 2500);

      if (!onePerUser && cooldown > 0)
        startCooldown(qId, Math.ceil(cooldown / 1000));
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setAnswering(null);
    }
  };

  // ── add question ───────────────────────────────────────────────────────────

  const handleAddQuestion = async () => {
    if (!qForm.text.trim() || !qForm.topic.trim()) return;
    setAddingQuestion(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        text: qForm.text,
        type: qForm.type,
        topic: qForm.topic,
        difficulty: qForm.difficulty,
        points: qForm.points,
        expiresInHours: qForm.expiresInHours,
        ...(qForm.type === "quiz"
          ? { options: qForm.options.filter((o) => o.text.trim()) }
          : { correctAnswer: qForm.correctAnswer }),
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${org._id}/questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify(payload),
        },
      );
      if (res.ok) {
        setShowAddQuestion(false);
        setQForm({
          text: "",
          type: "quiz",
          topic: "",
          difficulty: "medium",
          points: 10,
          correctAnswer: "",
          expiresInHours: 24,
          options: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        });
        fetchData();
      }
    } finally {
      setAddingQuestion(false);
    }
  };

  // ── toggle question ────────────────────────────────────────────────────────

  const toggleQuestion = async (qId) => {
    const token = localStorage.getItem("token");
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${org._id}/questions/${qId}/toggle`,
      {
        method: "PATCH",
        headers: { "x-auth-token": token },
      },
    );
    fetchData();
  };

  // ── generate AI ────────────────────────────────────────────────────────────

  const generateML = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ml/generate-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ ...mlConfig, orgId: org._id }),
        },
      );
      if (res.ok) {
        setShowMLModal(false);
        setMlConfig({ topic: "", difficulty: "medium", count: 5 });
        fetchData();
      }
    } finally {
      setGenerating(false);
    }
  };

  // ── discussion ─────────────────────────────────────────────────────────────

  const handleCreateDiscussion = async () => {
    if (!dForm.title.trim() || !dForm.content.trim()) return;
    setAddingDiscussion(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/discussions/${org._id}/discussions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({
            ...dForm,
            tags: dForm.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          }),
        },
      );
      if (res.ok) {
        setShowAddDiscussion(false);
        setDForm({ title: "", content: "", tags: "", allowReplies: true });
        fetchData();
      }
    } finally {
      setAddingDiscussion(false);
    }
  };

  const handleReply = async (discussionId) => {
    if (!replyText.trim()) return;
    setReplyingSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/discussions/${org._id}/discussions/${discussionId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ content: replyText }),
        },
      );
      if (res.ok) {
        setReplyText("");
        setReplyOpen(null);
        fetchData();
      } else {
        const e = await res.json();
        alert(e.msg);
      }
    } finally {
      setReplyingSending(false);
    }
  };

  const handleLike = async (discussionId) => {
    const token = localStorage.getItem("token");
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/discussions/${org._id}/discussions/${discussionId}/like`,
      {
        method: "POST",
        headers: { "x-auth-token": token },
      },
    );
    fetchData();
  };

  // ── loading / error ────────────────────────────────────────────────────────

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0EFFF] via-white to-[#EEF2FF] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#6C63FF] animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0EFFF] via-white to-[#EEF2FF]">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-lg text-center">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#2D2A5A] mb-2">{error}</h2>
          <button
            onClick={() => router.push("/dashboard")}
            className="mt-4 px-5 py-2 bg-[#6C63FF] text-white rounded-lg text-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );

  if (!org) return null;

  const creatorStartedDiscussion = discussions.length > 0;
  // For members: only show discussions that were started by owner (to enforce "creator starts it")
  const visibleDiscussions = isOwner
    ? discussions
    : discussions.filter(
        (d) =>
          d.author?._id?.toString() === ownerId ||
          d.author?.toString() === ownerId,
      );

  // For members: respect oneQuestionPerUser
  const canAnswerMore = !onePerUser || !userAnsweredAny;

  // Tab counts
  const activeQuizCount = isOwner
    ? questions.length
    : questions.filter((q) => {
        if (!q.isActive) return false;
        if (q.expiresAt && new Date(q.expiresAt) < new Date()) return false;
        return !q.answered;
      }).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0EFFF] via-white to-[#EEF2FF]">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* ── ORG HEADER ── */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-[#E6E4FF] mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-[#7A799D] hover:text-[#6C63FF] mb-5"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#2D2A5A] mb-2">
                {org.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-[#7A799D] flex items-center gap-1">
                  <Users size={14} />
                  {org.members?.length || 0} members
                </span>
                <span className="text-sm text-[#7A799D] flex items-center gap-1">
                  <Brain size={14} />
                  {questions.length} quizzes
                </span>
                <span className="text-sm text-[#7A799D] flex items-center gap-1">
                  <MessageSquare size={14} />
                  {discussions.length} discussions
                </span>
                {onePerUser && (
                  <Badge color="purple">
                    <Lock size={10} />
                    One answer per member
                  </Badge>
                )}
                {!onePerUser && cooldown > 0 && (
                  <Badge color="blue">
                    <Clock size={10} />
                    {cooldown / 1000}s cooldown
                  </Badge>
                )}
              </div>
            </div>
            {isOwner && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setShowAddDiscussion(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-[#E6E4FF] text-[#6C63FF] rounded-lg hover:bg-[#F5F4FF] transition-all"
                >
                  <MessageSquare size={14} /> New Discussion
                </button>
                <button
                  onClick={() => setShowAddQuestion(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-[#E6E4FF] text-[#6C63FF] rounded-lg hover:bg-[#F5F4FF] transition-all"
                >
                  <Plus size={14} /> Add Quiz
                </button>
                <button
                  onClick={() => setShowMLModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-gradient-to-r from-[#6C63FF] to-[#9C8FFF] text-white rounded-lg hover:opacity-90 transition-all"
                >
                  <Sparkles size={14} /> AI Generate
                </button>
              </div>
            )}
          </div>

          {/* member one-per-user notice */}
          {!isOwner && onePerUser && userAnsweredAny && (
            <div className="mt-4 px-4 py-2.5 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-700 flex items-center gap-2">
              <CheckCircle size={15} /> You've used your one answer for this
              organization.
            </div>
          )}
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 mb-6 border-b border-[#E6E4FF]">
          {[
            {
              id: "discussions",
              label: `Discussions (${visibleDiscussions.length})`,
              icon: MessageSquare,
            },
            {
              id: "questions",
              label: `Quizzes (${activeQuizCount})`,
              icon: Brain,
            },
            { id: "leaderboard", label: "Leaderboard", icon: Trophy },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-5 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === id
                  ? "text-[#6C63FF] border-b-2 border-[#6C63FF]"
                  : "text-[#7A799D] hover:text-[#6C63FF]"
              }`}
            >
              <Icon size={14} className="inline mr-1.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            DISCUSSIONS TAB
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "discussions" && (
          <div className="space-y-4">
            {/* Everyone can start a discussion (respects allowMessages) */}
            {!isOwner && !creatorStartedDiscussion ? (
              <EmptyState
                icon={MessageSquare}
                title="No discussions yet"
                subtitle="The creator hasn't started any discussions. Check back later!"
              />
            ) : (
              <>
                {/* Members can reply but not start new ones (unless creator) */}
                {isOwner && (
                  <button
                    onClick={() => setShowAddDiscussion(true)}
                    className="w-full p-4 border-2 border-dashed border-[#E6E4FF] rounded-2xl text-[#7A799D] hover:border-[#6C63FF] hover:text-[#6C63FF] transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus size={16} /> Start a new discussion
                  </button>
                )}

                {visibleDiscussions.length === 0 && isOwner && (
                  <EmptyState
                    icon={MessageSquare}
                    title="No discussions yet"
                    subtitle="Start one above to engage your community!"
                  />
                )}

                {visibleDiscussions.map((disc) => {
                  const isLiked = disc.likes?.some(
                    (l) => (l._id || l)?.toString() === user?._id?.toString(),
                  );
                  const replyBlocked = !disc.allowReplies;
                  // Cooldown: if org has cooldown, track last reply time per discussion
                  // (backend enforces, frontend just shows UI naturally)

                  return (
                    <div
                      key={disc._id}
                      className="bg-white rounded-2xl border border-[#E6E4FF] overflow-hidden"
                    >
                      <div className="p-5">
                        {/* author row */}
                        <div className="flex items-center gap-2.5 mb-3">
                          <Avatar name={disc.author?.username || "?"} />
                          <div>
                            <span className="text-sm font-semibold text-[#2D2A5A]">
                              {disc.author?.username}
                            </span>
                            <span className="text-xs text-[#7A799D] ml-2">
                              {new Date(disc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {!disc.allowReplies && (
                            <Badge color="gray">
                              <EyeOff size={10} />
                              Replies off
                            </Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-[#2D2A5A] mb-1">
                          {disc.title}
                        </h3>
                        <p className="text-sm text-[#7A799D] leading-relaxed mb-3">
                          {disc.content}
                        </p>

                        {disc.tags?.filter(Boolean).length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mb-3">
                            {disc.tags.filter(Boolean).map((tag, i) => (
                              <Badge key={i} color="indigo">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* actions */}
                        <div className="flex items-center gap-4 pt-3 border-t border-[#F5F4FF]">
                          <button
                            onClick={() => handleLike(disc._id)}
                            className={`flex items-center gap-1 text-sm transition-colors ${isLiked ? "text-[#6C63FF]" : "text-[#7A799D] hover:text-[#6C63FF]"}`}
                          >
                            <ThumbsUp size={14} /> {disc.likes?.length || 0}
                          </button>
                          {!replyBlocked && (
                            <button
                              onClick={() => {
                                setReplyOpen(
                                  replyOpen === disc._id ? null : disc._id,
                                );
                                setReplyText("");
                              }}
                              className="flex items-center gap-1 text-sm text-[#7A799D] hover:text-[#6C63FF] transition-colors"
                            >
                              <Reply size={14} /> {disc.replies?.length || 0}{" "}
                              {disc.replies?.length === 1 ? "reply" : "replies"}
                            </button>
                          )}
                        </div>

                        {/* replies list */}
                        {disc.replies?.length > 0 && !replyBlocked && (
                          <div className="mt-3 space-y-2 text-[#2D2A5A]">
                            {disc.replies.map((r, i) => (
                              <div
                                key={i}
                                className="flex gap-2.5 bg-[#F8F8FF] rounded-xl p-3"
                              >
                                <Avatar
                                  name={r.author?.username || "?"}
                                  size={6}
                                />
                                <div>
                                  <span className="text-xs font-semibold text-[#2D2A5A]">
                                    {r.author?.username}
                                  </span>
                                  <span className="text-xs text-[#7A799D] ml-2">
                                    {new Date(r.createdAt).toLocaleDateString()}
                                  </span>
                                  <p className="text-sm text-[#555] mt-0.5">
                                    {r.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* reply input */}
                        {replyOpen === disc._id && !replyBlocked && (
                          <div className="mt-3 flex gap-2 text-[#2D2A5A]">
                            <input
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                !e.shiftKey &&
                                handleReply(disc._id)
                              }
                              placeholder="Write a reply…"
                              className="flex-1 px-3 py-2 text-sm bg-[#F5F4FF] border border-[#E6E4FF] rounded-lg focus:outline-none focus:border-[#6C63FF]"
                            />
                            <button
                              onClick={() => handleReply(disc._id)}
                              disabled={!replyText.trim() || replyingSending}
                              className="px-3 py-2 bg-[#6C63FF] text-white rounded-lg hover:bg-[#5550E8] disabled:opacity-50"
                            >
                              {replyingSending ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            QUIZZES TAB
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "questions" && (
          <div className="space-y-4 text-[#2D2A5A]">
            {/* owner empty */}
            {isOwner && questions.length === 0 && (
              <EmptyState
                icon={Brain}
                title="No quizzes yet"
                subtitle="Create a quiz for your members to answer."
                action={
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setShowAddQuestion(true)}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-[#6C63FF] to-[#9C8FFF] text-white rounded-lg"
                    >
                      Add Quiz
                    </button>
                    <button
                      onClick={() => setShowMLModal(true)}
                      className="px-4 py-2 text-sm border border-[#E6E4FF] text-[#6C63FF] rounded-lg hover:bg-[#F5F4FF]"
                    >
                      AI Generate
                    </button>
                  </div>
                }
              />
            )}

            {/* member empty */}
            {!isOwner && activeQuizCount === 0 && (
              <EmptyState
                icon={Brain}
                title="No active quizzes"
                subtitle="Check back later — the creator will post quizzes here!"
              />
            )}

            {questions.map((q) => {
              const now = new Date();
              const expired = q.expiresAt && new Date(q.expiresAt) < now;
              const onCooldown = !!cooldowns[q._id];
              const isCreatorQ =
                q.createdBy?.toString() === user?._id?.toString();
              const blockedByOne =
                !isOwner && onePerUser && userAnsweredAny && !q.answered;

              // members: skip expired, inactive, already answered
              if (!isOwner) {
                if (isCreatorQ || !q.isActive || expired || q.answered)
                  return null;
              }

              return (
                <div
                  key={q._id}
                  className={`bg-white rounded-2xl border transition-all ${!isOwner && "hover:shadow-md"} ${!q.isActive ? "border-gray-200 opacity-60" : "border-[#E6E4FF]"}`}
                >
                  <div className="p-5">
                    {/* badges row */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-3">
                      <Badge
                        color={
                          q.difficulty === "easy"
                            ? "green"
                            : q.difficulty === "medium"
                              ? "yellow"
                              : "red"
                        }
                      >
                        {q.difficulty}
                      </Badge>
                      <Badge color="indigo">{q.topic}</Badge>
                      <Badge color="purple">{q.points} pts</Badge>
                      {q.expiresAt && !expired && (
                        <QuizCountdown expiresAt={q.expiresAt} />
                      )}
                      {expired && (
                        <Badge color="red">
                          <Timer size={10} />
                          Expired
                        </Badge>
                      )}
                      {isOwner && !q.isActive && (
                        <Badge color="gray">
                          <EyeOff size={10} />
                          Inactive
                        </Badge>
                      )}
                      {isOwner && (
                        <Badge color="blue">
                          <Eye size={10} />
                          {q.attemptedBy?.length || 0} attempts
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-[#2D2A5A] mb-4">
                      {q.text}
                    </h3>

                    {/* ── owner management view ── */}
                    {isOwner && isCreatorQ ? (
                      <div className="flex items-center justify-between bg-[#F5F4FF] rounded-xl p-3">
                        <div className="flex items-center gap-2 text-sm text-[#7A799D]">
                          <BarChart3 size={14} className="text-[#6C63FF]" />
                          <span>
                            {q.attemptedBy?.length || 0} members attempted
                          </span>
                        </div>
                        <button
                          onClick={() => toggleQuestion(q._id)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${q.isActive ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-100 text-green-700 hover:bg-green-200"}`}
                        >
                          {q.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    ) : /* ── already answered ── */
                    q.answered ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-sm text-green-700 font-medium">
                          Already answered
                        </span>
                      </div>
                    ) : /* ── blocked by one-per-user ── */
                    blockedByOne ? (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 text-sm text-purple-700 text-center">
                        You've used your one answer for this organization
                      </div>
                    ) : /* ── inactive ── */
                    !q.isActive ? (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
                        <EyeOff size={15} /> Quiz is currently inactive
                      </div>
                    ) : /* ── expired ── */
                    expired ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 text-center flex items-center justify-center gap-2">
                        <Timer size={15} /> This quiz has expired
                      </div>
                    ) : /* ── on cooldown ── */
                    onCooldown ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-center gap-2">
                        <Clock size={15} className="text-blue-500" />
                        <span className="text-sm text-blue-700 font-medium">
                          Next answer in <strong>{cooldowns[q._id]}s</strong>
                        </span>
                      </div>
                    ) : (
                      /* ── answer form ── */
                      <div className="space-y-2">
                        {q.type === "quiz" ? (
                          q.options?.map((opt, i) => (
                            <button
                              key={i}
                              onClick={() => handleAnswer(q._id, opt.text)}
                              disabled={answering === q._id}
                              className="w-full text-left px-4 py-3 text-sm bg-[#F8F8FF] hover:bg-[#EEEEFF] border border-[#E6E4FF] rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                              <span className="text-xs font-bold text-[#6C63FF] w-5 shrink-0">
                                {String.fromCharCode(65 + i)}.
                              </span>
                              {opt.text}
                            </button>
                          ))
                        ) : (
                          <div className="flex gap-2">
                            <input
                              id={`ans-${q._id}`}
                              type="text"
                              placeholder="Type your answer…"
                              className="flex-1 px-3 py-2.5 text-sm bg-[#F5F4FF] border border-[#E6E4FF] rounded-xl focus:outline-none focus:border-[#6C63FF]"
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  e.target.value.trim()
                                ) {
                                  handleAnswer(q._id, e.target.value);
                                  e.target.value = "";
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                const el = document.getElementById(
                                  `ans-${q._id}`,
                                );
                                if (el?.value.trim()) {
                                  handleAnswer(q._id, el.value);
                                  el.value = "";
                                }
                              }}
                              disabled={answering === q._id}
                              className="px-3 py-2.5 bg-[#6C63FF] text-white rounded-xl hover:bg-[#5550E8] disabled:opacity-50"
                            >
                              <Send size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            LEADERBOARD TAB
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "leaderboard" && (
          <div className="bg-white rounded-2xl border border-[#E6E4FF] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#F0EEFF] flex items-center gap-2">
              <Trophy size={18} className="text-[#6C63FF]" />
              <h2 className="font-semibold text-[#2D2A5A]">Top Performers</h2>
            </div>
            {leaderboard.length === 0 ? (
              <div className="p-12 text-center text-sm text-[#7A799D]">
                No answers yet — be the first!
              </div>
            ) : (
              <div className="divide-y divide-[#F5F4FF]">
                {leaderboard.map((m, i) => (
                  <div
                    key={i}
                    className="px-6 py-4 flex items-center justify-between hover:bg-[#FAFAFE] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? "bg-yellow-100 text-yellow-700" : i === 1 ? "bg-gray-100 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-[#F5F4FF] text-[#7A799D]"}`}
                      >
                        {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                      </div>
                      <div>
                        <p className="font-medium text-[#2D2A5A]">
                          {m.username}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-[#7A799D] flex items-center gap-1">
                            <Target size={10} />
                            {m.accuracy?.toFixed(1)}% accuracy
                          </span>
                          <span className="text-xs text-[#7A799D] flex items-center gap-1">
                            <CheckCircle size={10} />
                            {m.correct} correct
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-[#6C63FF]">
                        {m.points}
                      </p>
                      <p className="text-xs text-[#7A799D]">pts</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MODALS
        ══════════════════════════════════════════════════════════════════ */}

        {/* ── Add Discussion ── */}
        {showAddDiscussion && isOwner && (
          <Modal
            title="Start a Discussion"
            onClose={() => setShowAddDiscussion(false)}
          >
            <div className="space-y-3 text-sm text-[#2D2A5A]">
              <Field label="Title">
                <input
                  value={dForm.title}
                  onChange={(e) =>
                    setDForm((p) => ({ ...p, title: e.target.value }))
                  }
                  placeholder="What's on your mind?"
                  className={inputCls}
                />
              </Field>
              <Field label="Content">
                <textarea
                  rows={4}
                  value={dForm.content}
                  onChange={(e) =>
                    setDForm((p) => ({ ...p, content: e.target.value }))
                  }
                  placeholder="Share details…"
                  className={`${inputCls} resize-none`}
                />
              </Field>
              <Field label="Tags (comma separated)">
                <input
                  value={dForm.tags}
                  onChange={(e) =>
                    setDForm((p) => ({ ...p, tags: e.target.value }))
                  }
                  placeholder="e.g. react, help, question"
                  className={inputCls}
                />
              </Field>
              <label className="flex items-center gap-2 text-sm text-[#2D2A5A] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dForm.allowReplies}
                  onChange={(e) =>
                    setDForm((p) => ({ ...p, allowReplies: e.target.checked }))
                  }
                  className="w-4 h-4 accent-[#6C63FF]"
                />
                Allow members to reply
              </label>
              <ModalFooter
                onCancel={() => setShowAddDiscussion(false)}
                onConfirm={handleCreateDiscussion}
                loading={addingDiscussion}
                label="Post Discussion"
                disabled={!dForm.title.trim() || !dForm.content.trim()}
              />
            </div>
          </Modal>
        )}

        {/* ── Add Quiz ── */}
        {showAddQuestion && isOwner && (
          <Modal title="Create Quiz" onClose={() => setShowAddQuestion(false)}>
            <div className="space-y-3 text-[#2D2A5A]">
              <Field label="Question">
                <textarea
                  rows={2}
                  value={qForm.text}
                  onChange={(e) =>
                    setQForm((p) => ({ ...p, text: e.target.value }))
                  }
                  placeholder="Enter your quiz question…"
                  className={`${inputCls} resize-none`}
                />
              </Field>

              {/* type toggle */}
              <div className="grid grid-cols-2 gap-2">
                {["quiz", "normal"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setQForm((p) => ({ ...p, type: t }))}
                    className={`py-2 rounded-xl text-sm font-medium border transition-all ${qForm.type === t ? "bg-[#6C63FF] text-white border-[#6C63FF]" : "bg-[#F5F4FF] text-[#7A799D] border-[#E6E4FF]"}`}
                  >
                    {t === "quiz" ? "🔘 Multiple Choice" : "📝 Open Answer"}
                  </button>
                ))}
              </div>

              {/* options */}
              {qForm.type === "quiz" ? (
                <Field label="Options (select correct one)">
                  <div className="space-y-2">
                    {qForm.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct"
                          checked={opt.isCorrect}
                          onChange={() =>
                            setQForm((p) => ({
                              ...p,
                              options: p.options.map((o, j) => ({
                                ...o,
                                isCorrect: j === i,
                              })),
                            }))
                          }
                          className="accent-[#6C63FF]"
                        />
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) =>
                            setQForm((p) => ({
                              ...p,
                              options: p.options.map((o, j) =>
                                j === i ? { ...o, text: e.target.value } : o,
                              ),
                            }))
                          }
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          className={`flex-1 ${inputCls} py-2`}
                        />
                      </div>
                    ))}
                  </div>
                </Field>
              ) : (
                <Field label="Correct Answer">
                  <input
                    value={qForm.correctAnswer}
                    onChange={(e) =>
                      setQForm((p) => ({ ...p, correctAnswer: e.target.value }))
                    }
                    placeholder="Expected answer"
                    className={inputCls}
                  />
                </Field>
              )}

              <div className="grid grid-cols-3 gap-2">
                <Field label="Topic">
                  <input
                    value={qForm.topic}
                    onChange={(e) =>
                      setQForm((p) => ({ ...p, topic: e.target.value }))
                    }
                    placeholder="e.g. Science"
                    className={inputCls}
                  />
                </Field>
                <Field label="Difficulty">
                  <select
                    value={qForm.difficulty}
                    onChange={(e) =>
                      setQForm((p) => ({ ...p, difficulty: e.target.value }))
                    }
                    className={inputCls}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </Field>
                <Field label="Points">
                  <input
                    type="number"
                    min="1"
                    value={qForm.points}
                    onChange={(e) =>
                      setQForm((p) => ({ ...p, points: +e.target.value || 10 }))
                    }
                    className={inputCls}
                  />
                </Field>
              </div>

              <Field label="Expires in (hours, 0 = never)">
                <input
                  type="number"
                  min="0"
                  value={qForm.expiresInHours}
                  onChange={(e) =>
                    setQForm((p) => ({
                      ...p,
                      expiresInHours: +e.target.value || 0,
                    }))
                  }
                  className={inputCls}
                />
              </Field>

              <ModalFooter
                onCancel={() => setShowAddQuestion(false)}
                onConfirm={handleAddQuestion}
                loading={addingQuestion}
                label="Create Quiz"
                disabled={!qForm.text.trim() || !qForm.topic.trim()}
              />
            </div>
          </Modal>
        )}

        {/* ── AI Generate ── */}
        {showMLModal && isOwner && (
          <Modal
            title="AI Generate Quizzes"
            onClose={() => setShowMLModal(false)}
          >
            <div className="space-y-3 text-[#2D2A5A]">
              <Field label="Topic">
                <select
                  value={mlConfig.topic}
                  onChange={(e) =>
                    setMlConfig((p) => ({ ...p, topic: e.target.value }))
                  }
                  className={inputCls}
                >
                  <option value="">Select topic</option>
                  {mlTopics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Difficulty">
                <select
                  value={mlConfig.difficulty}
                  onChange={(e) =>
                    setMlConfig((p) => ({ ...p, difficulty: e.target.value }))
                  }
                  className={inputCls}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </Field>
              <Field label="Count">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={mlConfig.count}
                  onChange={(e) =>
                    setMlConfig((p) => ({ ...p, count: +e.target.value }))
                  }
                  className={inputCls}
                />
              </Field>
              <ModalFooter
                onCancel={() => setShowMLModal(false)}
                onConfirm={generateML}
                loading={generating}
                label="Generate"
                disabled={!mlConfig.topic}
              />
            </div>
          </Modal>
        )}

        {/* ── Answer Toast ── */}
        {lastResult && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div
              className={`px-5 py-3.5 rounded-2xl shadow-lg flex items-center gap-3 ${lastResult.isCorrect ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}
            >
              {lastResult.isCorrect ? (
                <CheckCircle size={18} className="text-green-500" />
              ) : (
                <XCircle size={18} className="text-red-500" />
              )}
              <div>
                <p
                  className={`text-sm font-semibold ${lastResult.isCorrect ? "text-green-700" : "text-red-700"}`}
                >
                  {lastResult.isCorrect ? "Correct!" : "Incorrect!"}
                </p>
                {lastResult.isCorrect && (
                  <p className="text-xs text-green-600">
                    +{lastResult.pointsEarned} points
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── shared modal components ───────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2.5 text-sm bg-[#F5F4FF] border border-[#E6E4FF] rounded-xl focus:outline-none focus:border-[#6C63FF] transition-colors";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#2D2A5A] mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 my-8 shadow-2xl">
        <h3 className="text-lg font-bold text-[#2D2A5A] mb-4">{title}</h3>
        {children}
      </div>
    </div>
  );
}

function ModalFooter({ onCancel, onConfirm, loading, label, disabled }) {
  return (
    <div className="flex gap-2 pt-1">
      <button
        onClick={onCancel}
        className="flex-1 py-2.5 text-sm border border-[#E6E4FF] text-[#7A799D] rounded-xl hover:bg-[#F5F4FF]"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={disabled || loading}
        className="flex-1 py-2.5 text-sm bg-gradient-to-r from-[#6C63FF] to-[#9C8FFF] text-white rounded-xl hover:opacity-90 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin mx-auto" />
        ) : (
          label
        )}
      </button>
    </div>
  );
}
