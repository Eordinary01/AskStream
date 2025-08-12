'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/app/components/Header';
import { MessageSquare, Lock, Unlock, Loader2 } from 'lucide-react';

export default function OrganizationPage() {
  const params = useParams();
  const orgUrl = params?.url; 

  const [organization, setOrganization] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [user, setUser] = useState(null);
  const [question, setQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [allowMessages, setAllowMessages] = useState(false);
  const [oneQuestionPerUser, setOneQuestionPerUser] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const router = useRouter();

  
  useEffect(() => {
    if (!orgUrl) return;

    if (!user) {
      fetchUserData();
    }
    if (!organization) {
      fetchOrganization();
    }
    fetchQuestions();
  }, [orgUrl]);

  useEffect(() => {
    if (organization) {
      setAllowMessages(organization.allowMessages);
      setOneQuestionPerUser(organization.oneQuestionPerUser);
    }
  }, [organization]);

  useEffect(() => {
    if (user && questions.length > 0) {
      setHasAsked(questions.some(q => q.user?._id === user._id));
    }
  }, [questions, user]);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`, {
        headers: { 'x-auth-token': token }
      });
      if (!res.ok) throw new Error('Failed fetching user');
      const data = await res.json();
      setUser(data);
    } catch {
      localStorage.removeItem('token');
      router.push('/');
    }
  };

  const fetchOrganization = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${orgUrl}`);
      if (!res.ok) throw new Error('Failed fetching organization');
      const data = await res.json();
      setOrganization(data);
    } catch {
      router.push('/');
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/${orgUrl}`);
      if (!res.ok) throw new Error('Failed fetching questions');
      const data = await res.json();
      setQuestions(data);
    } catch {
      // Silent fail
    }
  };

  const canAsk = oneQuestionPerUser ? !hasAsked : !cooldown;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!canAsk) {
      setResponseMessage(oneQuestionPerUser
        ? 'You cannot ask more than one question.'
        : 'Please wait before sending another message.');
      setTimeout(() => setResponseMessage(''), 3000);
      return;
    }
    if (!question.trim()) {
      setResponseMessage('Please enter a question.');
      setTimeout(() => setResponseMessage(''), 3000);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          organizationId: organization._id,
          content: question,
          isAnonymous
        })
      });
      const data = await res.json();
      if (res.ok) {
        const newQ = {
          ...data,
          user: data.isAnonymous
            ? { username: 'Anonymous' }
            : { username: user.username, _id: user._id }
        };
        setQuestions(qs => [newQ, ...qs]);
        setQuestion('');
        setResponseMessage('Question submitted!');
        setTimeout(() => setResponseMessage(''), 3000);
        if (oneQuestionPerUser) setHasAsked(true);
        else {
          setCooldown(true);
          setTimeout(() => setCooldown(false), organization?.cooldownTime ?? 60000);
        }
      } else {
        setResponseMessage(data.message || 'Failed to submit question.');
        if (res.status === 403) setHasAsked(true);
        setTimeout(() => setResponseMessage(''), 3000);
      }
    } catch {
      setResponseMessage('Failed to submit question.');
      setTimeout(() => setResponseMessage(''), 3000);
    }
  };

  const togglePermissions = async () => {
    const token = localStorage.getItem('token');
    if (!token) return router.push('/');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${organization._id}/toggle-messages`,
        {
          method: 'PATCH',
          headers: { 'x-auth-token': token }
        }
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAllowMessages(data.allowMessages);
      setResponseMessage(`Messages ${data.allowMessages ? 'enabled' : 'disabled'}.`);
      setTimeout(() => setResponseMessage(''), 3000);
    } catch {
      setResponseMessage('Failed to toggle message permissions.');
      setTimeout(() => setResponseMessage(''), 3000);
    }
  };

  if (!user || !organization) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
    </div>
  );

  const isCreator = user.isCreator && organization.owner === user._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <header className="bg-white rounded-2xl shadow-xl border p-8 flex justify-between items-center">
            <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text font-bold">
              {organization.name}
            </h1>
            {isCreator && (
              <button
                onClick={togglePermissions}
                className={`inline-flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition duration-300 ${allowMessages ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
              >
                {allowMessages
                  ? <><Lock className="w-5 h-5" /> Disable Messages</>
                  : <><Unlock className="w-5 h-5" /> Enable Messages</>}
              </button>
            )}
          </header>

          <section className="bg-white rounded-2xl shadow-xl border p-8">
            <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6 text-gray-800">
              <MessageSquare className="w-6 h-6 text-blue-500" /> Questions
            </h2>
            {questions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <MessageSquare className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                <p className="text-gray-500">No questions yet. Be the first to ask!</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {questions.map(q => (
                  <li key={q._id} className="group rounded-xl bg-gray-50 p-6 transition hover:bg-blue-50">
                    <p className="text-lg font-normal text-gray-950 ">{q.content}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium">
                        {(q.user?.username?.[0] ?? 'A').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">{q.user?.username ?? 'Anonymous'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {oneQuestionPerUser && hasAsked && (
            <div className="rounded-xl bg-yellow-100 border-l-4 border-yellow-400 p-4 text-yellow-700" role="alert">
              You have already submitted a question. One question limit applied!
            </div>
          )}

          {!oneQuestionPerUser && cooldown && (
            <div className="rounded-xl bg-yellow-100 border-l-4 border-yellow-400 p-4 text-yellow-700" role="alert">
              Please wait before submitting another question.
            </div>
          )}

          {user && !isCreator && allowMessages && canAsk && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border p-8 space-y-4">
              <textarea
                rows={4}
                className="w-full rounded border border-gray-300 p-3 focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Type your question here"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                required
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4"
                />
                <span>Ask as Anonymous</span>
              </label>
              <button
                type="submit"
                disabled={!question.trim() || cooldown}
                className="w-full rounded bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Question
              </button>
            </form>
          )}

          {!allowMessages && !isCreator && (
            <div className="rounded-xl bg-red-50 border-l-4 border-red-400 p-4 text-red-700 flex items-center space-x-2">
              <Lock className="h-6 w-6" />
              <span>Messaging is currently disabled for this organization.</span>
            </div>
          )}

          {responseMessage && (
            <div className="fixed bottom-4 right-4 rounded border border-gray-300 bg-white p-4 shadow-lg">
              {responseMessage}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
