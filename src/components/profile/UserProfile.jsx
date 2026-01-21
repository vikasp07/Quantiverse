import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { supabase } from "../utils/supabaseClient";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Timer,
  MonitorPlay,
  Wifi,
  History,
  ChevronDown,
  ChevronUp,
  Bell,
  Trash2,
  CheckCheck,
  X,
  Briefcase,
  ClipboardCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
} from "recharts";
import Layout from "../Layout";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const UserProfile = () => {
  const { userId: paramUserId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [expandedDates, setExpandedDates] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [stats, setStats] = useState({
    totalEnrolled: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    avgProgress: 0,
    totalTasks: 0,
    completedTasks: 0,
  });

  // Use paramUserId if provided, otherwise use currentUser's id
  const [userId, setUserId] = useState(paramUserId || null);

  // Check if current viewer is admin or viewing their own profile
  const isViewingOwnProfile = currentUser?.id === userId || !paramUserId;
  const canViewActivityData = isAdmin && !isViewingOwnProfile;

  // Get current user and check if admin
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        setCurrentUser(authUser);

        // Check if user is admin from user metadata or users table
        if (authUser) {
          // First try user metadata
          if (authUser.user_metadata?.role === "admin") {
            setIsAdmin(true);
            return;
          }

          // Then try users table
          try {
            const { data: userData, error } = await supabase
              .from("users")
              .select("role")
              .eq("id", authUser.id)
              .maybeSingle();

            if (!error && userData?.role === "admin") {
              setIsAdmin(true);
            }
          } catch (dbErr) {
            // Silently handle if table doesn't exist
            console.log("Users table not available for role check");
          }
        }
      } catch (err) {
        console.error("Error getting current user:", err);
      }
    };
    getCurrentUser();
  }, []);

  // Set userId when currentUser is available and no paramUserId
  useEffect(() => {
    if (!paramUserId && currentUser?.id) {
      setUserId(currentUser.id);
    } else if (paramUserId) {
      setUserId(paramUserId);
    }
  }, [paramUserId, currentUser]);

  // Fetch notifications when viewing own profile
  useEffect(() => {
    if (isViewingOwnProfile && userId) {
      fetchNotifications();
    }
  }, [isViewingOwnProfile, userId]);

  const fetchNotifications = async () => {
    if (!userId) return;
    
    setLoadingNotifications(true);
    try {
      const response = await fetch(`${API_URL}/api/notifications/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${userId}/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all: true })
      });
      
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${userId}/delete/${notificationId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notifications/${userId}/clear`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'enrollment':
        return <Briefcase className="w-5 h-5 text-blue-500" />;
      case 'quiz_passed':
        return <Award className="w-5 h-5 text-green-500" />;
      case 'quiz_attempt':
        return <ClipboardCheck className="w-5 h-5 text-orange-500" />;
      case 'task_completion':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'badge':
        return <Award className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Group sessions by date
  const groupedSessions = useMemo(() => {
    if (!activityData?.recent_sessions) return {};

    const groups = {};
    activityData.recent_sessions.forEach((session) => {
      const date = new Date(session.started_at).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!groups[date]) {
        groups[date] = {
          date,
          dateKey: new Date(session.started_at).toDateString(),
          sessions: [],
          totalDuration: 0,
          totalPagesViewed: 0,
        };
      }

      groups[date].sessions.push(session);
      groups[date].totalDuration += session.duration_seconds || 0;
      groups[date].totalPagesViewed += session.pages_visited?.length || 0;
    });

    // Sort by date descending
    return Object.values(groups).sort(
      (a, b) => new Date(b.dateKey) - new Date(a.dateKey)
    );
  }, [activityData?.recent_sessions]);

  const toggleDateExpand = (dateKey) => {
    setExpandedDates((prev) => ({
      ...prev,
      [dateKey]: !prev[dateKey],
    }));
  };

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  // Only fetch activity data if admin viewing another user's profile
  useEffect(() => {
    if (isAdmin && !isViewingOwnProfile && userId) {
      fetchActivityData();
    }
  }, [userId, isAdmin, isViewingOwnProfile]);

  const fetchUserProfile = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch user profile directly from backend API
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await axios.get(`${API_BASE}/admin/user/${userId}`);
      setUser(response.data.user);
      setEnrollments(response.data.enrollments || []);
      calculateStats(response.data.enrollments || []);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError("Failed to load user profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async () => {
    // Only admin can view activity data of other users
    if (!isAdmin || isViewingOwnProfile) return;

    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const response = await axios.get(
        `${API_BASE}/admin/user/${userId}/activity`
      );
      setActivityData(response.data);
    } catch (err) {
      console.error("Error fetching activity data:", err);
      // Don't set error - activity data is optional
    }
  };

  // Format seconds to readable time
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0s";

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Format page path for display
  const formatPagePath = (path) => {
    if (!path) return "Unknown";
    // Remove leading slash and capitalize
    const parts = path.replace(/^\//, "").split("/");
    if (parts[0] === "") return "Home";
    return (
      parts[0].charAt(0).toUpperCase() + parts[0].slice(1).replace(/-/g, " ")
    );
  };

  const calculateStats = (enrollmentData) => {
    const totalEnrolled = enrollmentData.length;
    const completed = enrollmentData.filter((e) => e.progress === 100).length;
    const inProgress = enrollmentData.filter(
      (e) => e.progress > 0 && e.progress < 100
    ).length;
    const notStarted = enrollmentData.filter((e) => e.progress === 0).length;
    const avgProgress =
      totalEnrolled > 0
        ? Math.round(
            enrollmentData.reduce((acc, e) => acc + (e.progress || 0), 0) /
              totalEnrolled
          )
        : 0;
    const totalTasks = enrollmentData.reduce(
      (acc, e) => acc + (e.total_tasks || 0),
      0
    );
    const completedTasks = enrollmentData.reduce(
      (acc, e) => acc + (e.completed_tasks || 0),
      0
    );

    setStats({
      totalEnrolled,
      completed,
      inProgress,
      notStarted,
      avgProgress,
      totalTasks,
      completedTasks,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Chart data
  const progressPieData = [
    { name: "Completed", value: stats.completed, color: "#10B981" },
    { name: "In Progress", value: stats.inProgress, color: "#F59E0B" },
    { name: "Not Started", value: stats.notStarted, color: "#EF4444" },
  ].filter((item) => item.value > 0);

  const taskCompletionData = [
    { name: "Completed", value: stats.completedTasks, fill: "#10B981" },
    {
      name: "Remaining",
      value: stats.totalTasks - stats.completedTasks,
      fill: "#E5E7EB",
    },
  ];

  const enrollmentProgressData = enrollments.map((e) => ({
    name: e.internship_name?.substring(0, 15) + "..." || "Internship",
    progress: e.progress || 0,
    tasks: e.completed_tasks || 0,
    total: e.total_tasks || 0,
  }));

  const enrollmentActivityChartData = enrollments.map((e, index) => ({
    month: new Date(e.enrolled_at).toLocaleDateString("en-US", {
      month: "short",
    }),
    enrollments: 1,
    progress: e.progress || 0,
  }));

  const skillsRadarData = [
    { skill: "Completion Rate", value: stats.avgProgress, fullMark: 100 },
    {
      skill: "Task Efficiency",
      value:
        stats.totalTasks > 0
          ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
          : 0,
      fullMark: 100,
    },
    {
      skill: "Engagement",
      value:
        stats.totalEnrolled > 0 ? Math.min(stats.totalEnrolled * 20, 100) : 0,
      fullMark: 100,
    },
    {
      skill: "Consistency",
      value: stats.inProgress > 0 ? 70 : stats.completed > 0 ? 100 : 0,
      fullMark: 100,
    },
    { skill: "Initiative", value: stats.totalEnrolled * 15, fullMark: 100 },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center min-h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading user profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* User Info Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.display_name ||
                  user?.user_name ||
                  (user?.first_name && user?.last_name
                    ? `${user.first_name} ${user.last_name}`.trim()
                    : null) ||
                  user?.email?.split("@")[0] ||
                  "User Profile"}
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span>
                    {user?.email || user?.user_email || "No email available"}
                  </span>
                </div>
                {user?.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-5 h-5 text-green-500" />
                    <span>{user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <span>
                    Joined: {formatDate(user?.created_at || user?.enrolled_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section - Only visible when viewing own profile */}
        {isViewingOwnProfile && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-6 h-6 text-indigo-600" />
                Notifications
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    {notifications.filter(n => !n.read).length} new
                  </span>
                )}
              </h2>
              <div className="flex gap-2">
                {notifications.filter(n => !n.read).length > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all as read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {loadingNotifications ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600">No notifications yet</h3>
                <p className="text-sm text-slate-400 mt-1">You'll see updates about your activities here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(showAllNotifications ? notifications : notifications.slice(0, 5)).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-all ${
                      !notification.read 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        !notification.read ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`font-medium ${!notification.read ? 'text-slate-900' : 'text-slate-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-slate-500 mt-0.5">{notification.message}</p>
                          </div>
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{formatTimeAgo(notification.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.length > 5 && (
                  <button
                    onClick={() => setShowAllNotifications(!showAllNotifications)}
                    className="w-full py-2 text-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {showAllNotifications 
                      ? 'Show less' 
                      : `Show ${notifications.length - 5} more notifications`
                    }
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Activity Tracking Section - Only visible to admins viewing other users */}
        {canViewActivityData && activityData && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-600" />
              User Activity & Time Tracking
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* First Seen */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    First Registered
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {activityData.first_seen
                    ? formatDate(activityData.first_seen)
                    : "N/A"}
                </p>
              </div>

              {/* Last Seen */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <History className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Last Active
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {activityData.last_seen
                    ? formatDate(activityData.last_seen)
                    : "N/A"}
                </p>
              </div>

              {/* Total Time on Platform */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Timer className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">
                    Total Time on Website
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDuration(activityData.total_time_seconds)}
                </p>
              </div>

              {/* Total Sessions */}
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MonitorPlay className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">
                    Total Sessions
                  </span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {activityData.total_sessions || 0}
                </p>
              </div>
            </div>

            {/* Online Status */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Wifi
                  className={`w-5 h-5 ${
                    activityData.is_currently_active
                      ? "text-green-500"
                      : "text-gray-400"
                  }`}
                />
                <span
                  className={`font-medium ${
                    activityData.is_currently_active
                      ? "text-green-700"
                      : "text-gray-500"
                  }`}
                >
                  {activityData.is_currently_active
                    ? "Currently Online"
                    : "Offline"}
                </span>
                {activityData.is_currently_active && (
                  <span className="ml-2 text-sm text-gray-500">
                    (Session:{" "}
                    {formatDuration(activityData.current_session_duration)})
                  </span>
                )}
              </div>
              <div className="ml-auto">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    activityData.is_currently_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      activityData.is_currently_active
                        ? "bg-green-500 animate-pulse"
                        : "bg-gray-400"
                    }`}
                  ></span>
                  {activityData.is_currently_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Page Analytics */}
            {activityData.page_analytics &&
              activityData.page_analytics.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    Time Spent on Each Screen
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Page
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Time
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Visits
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Avg. Time/Visit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {activityData.page_analytics.map((page, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">
                                {formatPagePath(page.page_path)}
                              </span>
                              <span className="block text-xs text-gray-400">
                                {page.page_path}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm text-gray-700">
                                {formatDuration(page.total_seconds)}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm text-gray-700">
                                {page.visit_count}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-sm text-gray-700">
                                {formatDuration(
                                  Math.round(
                                    page.total_seconds / page.visit_count
                                  )
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {/* Recent Sessions - Grouped by Date */}
            {groupedSessions && groupedSessions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-500" />
                  Session History (Grouped by Date)
                </h3>
                <div className="space-y-3">
                  {groupedSessions.map((dayData) => (
                    <div
                      key={dayData.dateKey}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      {/* Date Header - Clickable */}
                      <button
                        onClick={() => toggleDateExpand(dayData.dateKey)}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-gray-900">
                              {dayData.date}
                            </p>
                            <p className="text-sm text-gray-500">
                              {dayData.sessions.length} session
                              {dayData.sessions.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-semibold text-indigo-600">
                              {formatDuration(dayData.totalDuration)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {dayData.totalPagesViewed} pages viewed
                            </p>
                          </div>
                          {expandedDates[dayData.dateKey] ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Sessions List */}
                      {expandedDates[dayData.dateKey] && (
                        <div className="p-4 bg-white space-y-2">
                          {dayData.sessions.map((session, sIdx) => (
                            <div
                              key={sIdx}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
                                  <MonitorPlay className="w-4 h-4 text-indigo-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    Session {dayData.sessions.length - sIdx}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Started at{" "}
                                    {new Date(
                                      session.started_at
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-700">
                                  {formatDuration(session.duration_seconds)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {session.pages_visited?.length || 0} pages
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submissions History - Admin Only */}
            {activityData.submissions && activityData.submissions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-green-500" />
                  Quiz Submission History
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date & Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Task ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Score
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Percentage
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Attempt
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activityData.submissions.slice(0, 20).map((submission, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {submission.timestamp 
                              ? new Date(submission.timestamp).toLocaleString()
                              : 'N/A'
                            }
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {submission.task_id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {submission.score}/{submission.total_marks}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <span className={`${
                              submission.percentage >= 70 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {submission.percentage?.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              submission.passed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {submission.passed ? '✓ Passed' : '✗ Failed'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            #{submission.attempt_number}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Activity Event History - Admin Only */}
            {activityData.activity_history && activityData.activity_history.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Activity Event Log
                </h3>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  <div className="divide-y divide-gray-100">
                    {activityData.activity_history.slice(0, 30).map((event, index) => (
                      <div key={index} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <span className={`w-2 h-2 rounded-full ${
                            event.event_type === 'session_start' ? 'bg-green-500' :
                            event.event_type === 'session_end' ? 'bg-red-500' :
                            event.event_type === 'quiz_submission' ? 'bg-blue-500' :
                            event.event_type === 'enrollment' ? 'bg-purple-500' :
                            'bg-gray-400'
                          }`}></span>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {event.event_type.replace(/_/g, ' ')}
                          </span>
                          {event.details && Object.keys(event.details).length > 0 && (
                            <span className="text-xs text-gray-500">
                              {event.details.passed !== undefined && (
                                <span className={event.details.passed ? 'text-green-600' : 'text-red-600'}>
                                  {event.details.passed ? ' (Passed)' : ' (Failed)'}
                                </span>
                              )}
                              {event.details.percentage !== undefined && (
                                <span> - {event.details.percentage?.toFixed(0)}%</span>
                              )}
                              {event.details.duration_seconds !== undefined && (
                                <span> - {formatDuration(event.details.duration_seconds)}</span>
                              )}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {event.timestamp 
                            ? new Date(event.timestamp).toLocaleString()
                            : 'N/A'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Enrolled
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalEnrolled}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.inProgress}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Avg Progress
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.avgProgress}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Analytics Dashboard
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Internship Progress Status - Pie Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-blue-500" />
              Internship Progress Status
            </h3>
            {progressPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={progressPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {progressPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No enrollment data available
              </div>
            )}
          </div>

          {/* Task Completion Gauge */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Task Completion Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskCompletionData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {taskCompletionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center -mt-20">
              <p className="text-4xl font-bold text-gray-900">
                {stats.completedTasks}/{stats.totalTasks}
              </p>
              <p className="text-gray-500">Tasks Completed</p>
            </div>
          </div>

          {/* Progress by Internship - Bar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              Progress by Internship
            </h3>
            {enrollmentProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={enrollmentProgressData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="name" width={120} />
                  <Tooltip
                    formatter={(value, name) => [`${value}%`, "Progress"]}
                  />
                  <Bar
                    dataKey="progress"
                    fill="#8B5CF6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No enrollment data available
              </div>
            )}
          </div>

          {/* Skills Radar Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              Performance Metrics
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={skillsRadarData}
              >
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.5}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Timeline - Area Chart */}
        {enrollments && enrollments.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Progress Over Time
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={enrollments.map((e, i) => ({
                  date: formatDate(e.enrolled_at).split(",")[0],
                  progress: e.progress || 0,
                  tasks: e.completed_tasks || 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="progress"
                  stroke="#3B82F6"
                  fill="#93C5FD"
                  name="Progress %"
                />
                <Area
                  type="monotone"
                  dataKey="tasks"
                  stroke="#10B981"
                  fill="#A7F3D0"
                  name="Tasks Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Enrolled Internships Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Enrolled Internships ({enrollments.length})
            </h3>
          </div>

          {enrollments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Internship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Since Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment, index) => {
                  // Calculate time since registration
                  const registeredAt = new Date(enrollment.enrolled_at);
                  const now = new Date();
                  const diffMs = now - registeredAt;
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                  const diffHours = Math.floor(
                    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                  );
                  const diffMins = Math.floor(
                    (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                  );

                  let timeSinceRegistered = "";
                  if (diffDays > 0) {
                    timeSinceRegistered = `${diffDays}d ${diffHours}h ago`;
                  } else if (diffHours > 0) {
                    timeSinceRegistered = `${diffHours}h ${diffMins}m ago`;
                  } else {
                    timeSinceRegistered = `${diffMins}m ago`;
                  }

                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.internship_name || "Internship"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(enrollment.enrolled_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-blue-500" />
                          {timeSinceRegistered}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {enrollment.completed_tasks || 0} /{" "}
                          {enrollment.total_tasks || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-32">
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                enrollment.progress === 100
                                  ? "bg-green-500"
                                  : enrollment.progress > 0
                                  ? "bg-blue-500"
                                  : "bg-gray-300"
                              }`}
                              style={{ width: `${enrollment.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            enrollment.progress === 100
                              ? "bg-green-100 text-green-800"
                              : enrollment.progress > 0
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {enrollment.progress === 100
                            ? "Completed"
                            : enrollment.progress > 0
                            ? "In Progress"
                            : "Not Started"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Enrollments Yet
              </h3>
              <p className="text-gray-500">
                This user hasn't enrolled in any internships yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
