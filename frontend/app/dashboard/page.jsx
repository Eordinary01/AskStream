'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [orgLink, setOrgLink] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      fetchUserData(token);
      fetchOrganizations(token);
    }
  }, []);

  const showResponseMessage = (message, duration = 3000) => {
    setResponseMessage(message);
    setTimeout(() => setResponseMessage(''), duration);
  };

  const fetchUserData = async (token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`, {
        headers: {
          'x-auth-token': token
        }
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

  const fetchOrganizations = async (token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations/my`, {
        headers: {
          'x-auth-token': token
        }
      });
      if (response.ok) {
        const orgs = await response.json();
        setOrganizations(orgs);
      } else {
        throw new Error('Failed to fetch organizations');
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      showResponseMessage('Failed to fetch organizations', 5000);
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ name: newOrgName })
      });
      if (response.ok) {
        const newOrg = await response.json();
        setOrganizations([...organizations, newOrg]);
        setNewOrgName('');
        showResponseMessage('Organization created successfully');
      } else {
        throw new Error('Failed to create organization');
      }
    } catch (error) {
      console.error('Error creating organization:', error);
      showResponseMessage('Failed to create organization', 5000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  const handleJoinOrg = (e) => {
    e.preventDefault();
    if (orgLink) {
      router.push(orgLink);
    } else {
      showResponseMessage('Please enter a valid organization link', 5000);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showResponseMessage('Link copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
      showResponseMessage('Failed to copy link', 5000);
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Dashboard</h1>
        {responseMessage && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">
            {responseMessage}
          </div>
        )}
        {user && (
          <>
            {user.isCreator ? (
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Your Organizations:</h2>
                <ul className="space-y-4 text-gray-900">
                  {organizations.map(org => (
                    <li key={org._id} className="bg-gray-50 p-4 rounded">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{org.name}</span>
                        <Link href={`/org/${org.uniqueUrl}`} className="text-blue-500 hover:text-blue-700 transition duration-300">
                          View
                        </Link>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Shareable link:</span>
                        <div className="flex items-center">
                          <input 
                            type="text" 
                            value={` /org/${org.uniqueUrl}`} 
                            readOnly 
                            className="bg-gray-100 px-2 py-1 rounded mr-2 text-xs"
                          />
                          <button 
                            onClick={() => copyToClipboard(`/org/${org.uniqueUrl}`)}
                            className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition duration-300"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <form onSubmit={handleCreateOrg} className="mt-6">
                  <input
                    type="text"
                    placeholder="New Organization Name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                  <button type="submit" className="mt-4 w-full bg-blue-500 text-white rounded-md py-2 hover:bg-blue-600 transition duration-300">
                    Create Organization
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-yellow-500">Join an Organization</h2>
                <form onSubmit={handleJoinOrg}>
                  <input
                    type="text"
                    placeholder="Enter organization link"
                    value={orgLink}
                    onChange={(e) => setOrgLink(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                  <button type="submit" className="mt-4 w-full bg-blue-500 text-white rounded-md py-2 hover:bg-blue-600 transition duration-300">
                    Join Organization
                  </button>
                </form>
              </div>
            )}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-yellow-500">Your Joined Organizations:</h2>
              <ul className="space-y-2 text-gray-900">
                {organizations.map(org => (
                  <li key={org._id} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <span>{org.name}</span>
                    <Link href={`/org/${org.uniqueUrl}`} className="text-blue-500 hover:text-blue-700 transition duration-300">
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </main>
    </div>
  );
}