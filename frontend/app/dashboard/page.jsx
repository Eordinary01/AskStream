"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import {
  Building2,
  Plus,
  Link as LinkIcon,
  Copy,
  Loader2,
  LogOut,
  UserPlus,
  Users,
} from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [orgLink, setOrgLink] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  // New state variables for cooldown and oneQuestionPerUser (single message limit)
  const [cooldownTime, setCooldownTime] = useState(60); // seconds
  const [oneQuestionPerUser, setOneQuestionPerUser] = useState(false);

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
          headers: {
            "x-auth-token": token,
          },
        }
      );
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error("Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.removeItem("token");
      router.push("/");
    }
  };

  const fetchOrganizations = async (token) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/my`,
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );
      if (response.ok) {
        const orgs = await response.json();
        setOrganizations(orgs);
      } else {
        throw new Error("Failed to fetch organizations");
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      showResponseMessage("Failed to fetch organizations", 5000);
    }
  };

  // Updated handleCreateOrg to include cooldownTime and oneQuestionPerUser,
  // ensuring only one of cooldown or oneQuestionPerUser can be selected.
  const handleCreateOrg = async (e) => {
    e.preventDefault();

    // Validation: must select exactly one of the limits (cooldown or oneQuestionPerUser)
    if ((cooldownTime > 0 && oneQuestionPerUser) || (cooldownTime === 0 && !oneQuestionPerUser)) {
      showResponseMessage(
        "Please select either a cooldown time (greater than 0) OR 'one question per user', but not both.",
        5000
      );
      return;
    }

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
            cooldownTime: oneQuestionPerUser ? 0 : cooldownTime * 1000, // cooldownTime in ms or 0 if one-question-per-user is true
            oneQuestionPerUser,
          }),
        }
      );
      if (response.ok) {
        const newOrg = await response.json();
        setOrganizations([...organizations, newOrg]);
        setNewOrgName("");
        setCooldownTime(60);
        setOneQuestionPerUser(false);
        showResponseMessage("Organization created successfully");
      } else {
        throw new Error("Failed to create organization");
      }
    } catch (error) {
      console.error("Error creating organization:", error);
      showResponseMessage("Failed to create organization", 5000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const handleJoinOrg = async (e) => {
    e.preventDefault();
    if (!orgLink || !orgLink.trim()) {
      showResponseMessage("Please enter a valid organization link", 5000);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      // Extract unique URL part from input
      let uniqueUrl = orgLink.trim();

      // If user pastes full URL, extract just the unique part
      if (uniqueUrl.includes("/org/")) {
        uniqueUrl = uniqueUrl.split("/org/")[1];
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/organizations/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token,
          },
          body: JSON.stringify({ uniqueUrl }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        showResponseMessage(data.msg);
        setOrganizations((prev) => [...prev, data.organization]);
        setOrgLink("");
        router.push(`/org/${uniqueUrl}`); // redirect to org page after joining
      } else {
        const errorData = await response.json();
        showResponseMessage(
          errorData.msg || "Failed to join organization",
          5000
        );
      }
    } catch (error) {
      console.error("Join org error:", error);
      showResponseMessage("An unexpected error occurred", 5000);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        showResponseMessage("Link copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
        showResponseMessage("Failed to copy link", 5000);
      }
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Dashboard Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-300"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        {user && (
          <div className="space-y-8 text-gray-950">
            {user.isCreator ? (
              /* Creator's Organizations Section */
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Building2 className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Your Organizations
                  </h2>
                </div>

                <div className="space-y-4">
                  {organizations.map((org) => (
                    <div
                      key={org._id}
                      className="group bg-gray-50 hover:bg-blue-50 rounded-xl p-6 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {org.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold text-lg text-gray-800">
                            {org.name}
                          </span>
                        </div>
                        <Link
                          href={`/org/${org.uniqueUrl}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all duration-300"
                        >
                          <Users className="w-4 h-4" />
                          View Organization
                        </Link>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-lg p-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <LinkIcon className="w-4 h-4" />
                          <span className="text-sm">Shareable link:</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={`/org/${org.uniqueUrl}`}
                            readOnly
                            className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-600 focus:outline-none"
                          />
                          <button
                            onClick={() =>
                              copyToClipboard(`/org/${org.uniqueUrl}`)
                            }
                            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create Organization Form */}
                <form
                  onSubmit={handleCreateOrg}
                  className="mt-8 bg-gray-50 rounded-xl p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-500" />
                    Create New Organization
                  </h3>
                  <div className="flex flex-col gap-4">
                    <input
                      type="text"
                      placeholder="Enter organization name"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      required
                    />
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={oneQuestionPerUser}
                        onChange={(e) => {
                          setOneQuestionPerUser(e.target.checked);
                          if (e.target.checked) setCooldownTime(0);
                        }}
                        className="w-5 h-5"
                      />
                      <span className="text-gray-800">Allow only one question per user</span>
                    </label>
                    <div>
                      <label className="block mb-1 text-gray-800">Cooldown time (seconds, disable if above checked)</label>
                      <input
                        type="number"
                        min="0"
                        value={cooldownTime}
                        onChange={(e) => {
                          setCooldownTime(Number(e.target.value));
                          if (Number(e.target.value) > 0) setOneQuestionPerUser(false);
                        }}
                        className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                        disabled={oneQuestionPerUser}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transform hover:-translate-y-0.5 transition-all duration-300"
                    disabled={!newOrgName.trim()}
                  >
                    <Plus className="w-5 h-5" />
                    Create
                  </button>
                </form>
              </div>
            ) : (
              /* User's Join Organization Section */
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <UserPlus className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Join an Organization
                  </h2>
                </div>
                <form
                  onSubmit={handleJoinOrg}
                  className="bg-gray-50 rounded-xl p-6"
                >
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Enter organization link"
                      value={orgLink}
                      onChange={(e) => setOrgLink(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-black"
                      required
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <UserPlus className="w-5 h-5" />
                      Join
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Joined Organizations Section */}
            {!user.isCreator && (
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-semibold text-gray-800">
                    Your Joined Organizations
                  </h2>
                </div>
                {organizations.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">
                      No organizations joined yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {organizations.map((org) => (
                      <div
                        key={org._id}
                        className="group flex items-center justify-between bg-gray-50 hover:bg-blue-50 p-6 rounded-xl transition-all duration-300"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {org.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">
                            {org.name}
                          </span>
                        </div>
                        <Link
                          href={`/org/${org.uniqueUrl}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all duration-300"
                        >
                          <Users className="w-4 h-4" />
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Response Message */}
        {responseMessage && (
          <div className="fixed bottom-8 right-8 animate-fade-in-up">
            <div className="bg-white px-6 py-4 rounded-xl shadow-lg border-l-4 border-blue-500">
              <p className="text-gray-800">{responseMessage}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
