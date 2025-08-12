'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/app/components/Header';
import { MessageSquare, Lock, Unlock, Loader2, AlertCircle } from 'lucide-react';

export default function OrganizationPage() {
  const params = useParams();
  const orgUrl = params?.url; 
  const router = useRouter();

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
  
  // Loading and error states
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orgUrl) {
      setError('Invalid organization URL');
      return;
    }
    
    initializePage();
  }, [orgUrl]);

  useEffect(() => {
    if (organization) {
      setAllowMessages(organization.allowMessages || false);
      setOneQuestionPerUser(organization.oneQuestionPerUser || false);
    }
  }, [organization]);

  useEffect(() => {
    if (user && questions.length > 0) {
      setHasAsked(questions.some(q => q.user?._id === user._id));
    }
  }, [questions, user]);

  const initializePage = async () => {
    try {
      await Promise.all([
        fetchUserData(),
        fetchOrganization(),
        fetchQuestions()
      ]);
    } catch (err) {
      console.error('Error initializing page:', err);
      setError('Failed to load page data');
    }
  };

  const fetchUserData = async () => {
    const token = localStorage?.getItem('token');
    if (!token) {
      setIsLoadingUser(false);
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
    } catch (err) {
      console.error('Error fetching user:', err);
      localStorage?.removeItem('token');
      router.push('/');
    } finally {
      setIsLoadingUser(false);
    }
  };

  const fetchOrganization = async () => {
    if (!orgUrl) {
      setIsLoadingOrg(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${orgUrl}`);
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Organization not found');
        }
        throw new Error('Failed fetching organization');
      }
      
      const data = await res.json();
      setOrganization(data);
    } catch (err) {
      console.error('Error fetching organization:', err);
      setError(err.message || 'Failed to load organization');
      router.push('/');
    } finally {
      setIsLoadingOrg(false);
    }
  };

  const fetchQuestions = async () => {
    if (!orgUrl) {
      setIsLoadingQuestions(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/${orgUrl}`);
      
      if (res.ok) {
        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : []);
      } else {
        console.warn('Failed to fetch questions, using empty array');
        setQuestions([]);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      setQuestions([]);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const showMessage = (message) => {
    setResponseMessage(message);
    setTimeout(() => setResponseMessage(''), 3000);
  };

  const canAsk = oneQuestionPerUser ? !hasAsked : !cooldown;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canAsk) {
      showMessage(oneQuestionPerUser
        ? 'You cannot ask more than one question.'
        : 'Please wait before sending another message.');
      return;
    }
    
    if (!question.trim()) {
      showMessage('Please enter a question.');
      return;
    }

    const token = localStorage?.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          organizationId: organization?._id,
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
            : { username: user?.username || 'Unknown', _id: user?._id }
        };
        setQuestions(qs => [newQ, ...qs]);
        setQuestion('');
        showMessage('Question submitted successfully!');
        
        if (oneQuestionPerUser) {
          setHasAsked(true);
        } else {
          setCooldown(true);
          setTimeout(() => setCooldown(false), organization?.cooldownTime ?? 60000);
        }
      } else {
        showMessage(data.message || 'Failed to submit question.');
        if (res.status === 403) setHasAsked(true);
      }
    } catch (err) {
      console.error('Error submitting question:', err);
      showMessage('Failed to submit question. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermissions = async () => {
    const token = localStorage?.getItem('token');
    if (!token) return router.push('/');
    
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${organization?._id}/toggle-messages`,
        {
          method: 'PATCH',
          headers: { 'x-auth-token': token }
        }
      );
      
      if (!res.ok) throw new Error('Failed to toggle permissions');
      
      const data = await res.json();
      setAllowMessages(data.allowMessages);
      showMessage(`Messages ${data.allowMessages ? 'enabled' : 'disabled'}.`);
    } catch (err) {
      console.error('Error toggling permissions:', err);
      showMessage('Failed to toggle message permissions.');
    }
  };

  // Loading state
  const isLoading = isLoadingUser || isLoadingOrg || isLoadingQuestions;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Page</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading organization...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl border max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Required</h2>
          <p className="text-gray-600">Please log in to access this organization.</p>
        </div>
      </div>
    );
  }

  const isCreator = user.isCreator && organization.owner === user._id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <header className="bg-white rounded-2xl shadow-xl border p-8 flex justify-between items-center">
            <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text font-bold">
              {organization.name || 'Organization'}
            </h1>
            {isCreator && (
              <button
                onClick={togglePermissions}
                className={`inline-flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition duration-300 ${
                  allowMessages 
                    ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {allowMessages ? (
                  <>
                    <Lock className="w-5 h-5" /> 
                    Disable Messages
                  </>
                ) : (
                  <>
                    <Unlock className="w-5 h-5" /> 
                    Enable Messages
                  </>
                )}
              </button>
            )}
          </header>

          <section className="bg-white rounded-2xl shadow-xl border p-8">
            <h2 className="flex items-center gap-2 text-2xl font-semibold mb-6 text-gray-800">
              <MessageSquare className="w-6 h-6 text-blue-500" /> 
              Questions
            </h2>
            
            {isLoadingQuestions ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading questions...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <MessageSquare className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                <p className="text-gray-500">No questions yet. Be the first to ask!</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {questions.map(q => (
                  <li key={q._id} className="group rounded-xl bg-gray-50 p-6 transition hover:bg-blue-50">
                    <p className="text-lg font-normal text-gray-950">{q.content}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-medium">
                        {(q.user?.username?.[0] ?? 'A').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {q.user?.username ?? 'Anonymous'}
                      </span>
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
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl text-gray-950 shadow-xl border p-8 space-y-4">
              <textarea
                rows={4}
                className="w-full rounded border border-gray-300 p-3 focus:border-blue-500 focus:ring focus:ring-blue-200"
                placeholder="Type your question here"
                value={question}
                onChange={e => setQuestion(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4"
                  disabled={isSubmitting}
                />
                <span>Ask as Anonymous</span>
              </label>
              <button
                type="submit"
                disabled={!question.trim() || cooldown || isSubmitting}
                className="w-full rounded bg-blue-600 py-3 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Question'
                )}
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
            <div className="fixed bottom-4 right-4 rounded border text-gray-900 border-gray-300 bg-white p-4 shadow-lg z-50">
              {responseMessage}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}