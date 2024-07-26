'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';

export default function OrganizationPage({ params }) {
  const [organization, setOrganization] = useState(null);
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState([]);
  const [user, setUser] = useState(null);
  const [allowMessages, setAllowMessages] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchOrganization();
    fetchQuestions();
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`, {
        headers: { 'x-auth-token': token }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${params.url}`);
      if (response.ok) {
        const orgData = await response.json();
        setOrganization(orgData);
        setAllowMessages(orgData.allowMessages);
      } else {
        throw new Error('Failed to fetch organization');
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      router.push('/');
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions/${params.url}`);
      if (response.ok) {
        const questionsData = await response.json();
        setQuestions(questionsData);
      } else {
        throw new Error('Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (cooldown) {
      setResponseMessage('Please wait before sending another message');
      setTimeout(() => setResponseMessage(''), 3000);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ 
          organizationId: organization._id,
          content: question
        })
      });
      if (response.ok) {
        const newQuestion = await response.json();
        setQuestions([...questions, newQuestion]);
        setQuestion('');
        setCooldown(true);
        setResponseMessage('Question submitted successfully');
        setTimeout(() => setResponseMessage(''), 3000);
        setTimeout(() => setCooldown(false), 60000); // 1 minute cooldown
      } else if (response.status === 429) {
        setResponseMessage('Please wait before sending another message');
        setTimeout(() => setResponseMessage(''), 3000);
      } else {
        throw new Error('Failed to submit question');
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      setResponseMessage('Failed to submit question');
      setTimeout(() => setResponseMessage(''), 3000);
    }
  };

  const toggleMessagePermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/${organization._id}/toggle-messages`, {
        method: 'PATCH',
        headers: {
          'x-auth-token': token
        }
      });
      if (response.ok) {
        const updatedOrg = await response.json();
        setAllowMessages(updatedOrg.allowMessages);
        setResponseMessage(`Messages ${updatedOrg.allowMessages ? 'enabled' : 'disabled'}`);
        setTimeout(() => setResponseMessage(''), 3000);
      } else {
        throw new Error('Failed to toggle message permissions');
      }
    } catch (error) {
      console.error('Error toggling message permissions:', error);
      setResponseMessage('Failed to toggle message permissions');
      setTimeout(() => setResponseMessage(''), 3000);
    }
  };

  if (!organization || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isCreator = user.isCreator && organization.owner === user._id;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-6 py-8">
        {organization && (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{organization.name}</h1>
            {isCreator && (
              <div className="mb-4">
                <button 
                  onClick={toggleMessagePermissions}
                  className={`px-4 py-2 ${allowMessages ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white rounded-md transition duration-300`}
                >
                  {allowMessages ? 'Disable Messages' : 'Enable Messages'}
                </button>
              </div>
            )}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Questions</h2>
              {questions.length === 0 ? (
                <p className="text-gray-500">No questions yet. Be the first to ask!</p>
              ) : (
                <ul className="space-y-4">
                  {questions.map(q => (
                    <li key={q._id} className="bg-white p-4 rounded-lg shadow">
                      <p className="text-gray-800">{q.content}</p>
                      <p className="text-sm text-gray-500 mt-2">Asked by: {q.user?.username}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {user && !isCreator && allowMessages && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Ask a Question</h2>
                <form onSubmit={handleSubmitQuestion}>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your question here..."
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  ></textarea>
                  <button 
                    type="submit" 
                    className={`mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 ease-in-out transform hover:-translate-y-1 ${cooldown ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={cooldown}
                  >
                    Submit Question
                  </button>
                </form>
              </div>
            )}
            {!allowMessages && !isCreator && (
              <p className="text-red-500 mt-4">Messaging is currently disabled for this organization.</p>
            )}
            {responseMessage && (
              <div className="mt-4 p-2 bg-blue-100 text-blue-800 rounded-md">
                {responseMessage}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}