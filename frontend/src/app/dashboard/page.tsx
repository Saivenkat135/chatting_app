
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import "./dashboard.css";

const API_URL = "http://localhost:8000";
const SOCKET_URL = "http://localhost:3001";

type User = {
  userId: string;
  username?: string;
  email?: string;
};

type FriendRequest = {
  id?: string;
  friendId?: string;
  userId?: string;
  requestId?: string;
  friendshipId?: string;
  user1Id?: string;
  user2Id?: string;
  senderId?: string;
  receiverId?: string;
  fromUserId?: string;
  toUserId?: string;
  username?: string;
  senderName?: string;
  receiverName?: string;
  status?: string;
  createdAt?: string;
};

type Friend = {
  id?: string;
  userId?: string;
  friendId?: string;
  username?: string;
  email?: string;
  user1Id?: string;
  user2Id?: string;
  status?: string;
  requestId?: string;
};

type Conversation = {
  id?: string;
  conversationId?: string;
  type?: string;
  participants?: string[];
  createdAt?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  username?: string;
  name?: string;
};

type ChatMessage = {
  id?: string;
  conversationId?: string;
  senderId: string;
  receiverId: string;
  content?: string;
  text?: string;
  timestamp?: string;
  createdAt?: string;
  read?: boolean;
};

type Tab = "chats" | "requests";
type RequestFilter = "received" | "sent";

function getArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    for (const key of [
      "data",
      "content",
      "requests",
      "friends",
      "conversations",
      "messages",
    ]) {
      if (Array.isArray(obj[key])) {
        return obj[key] as T[];
      }
    }
  }

  return [];
}

function getConversationId(chat: Conversation): string {
  return String(chat.conversationId || chat.id || "");
}

function getRequestId(request: FriendRequest): string {
  return String(
    request.requestId || request.friendshipId || request.id || ""
  );
}

function getRequestUserId(request: FriendRequest): string {
  return String(
    request.id ||
      request.friendId ||
      request.userId ||
      request.user1Id ||
      request.user2Id ||
      request.senderId ||
      request.receiverId ||
      request.fromUserId ||
      request.toUserId ||
      ""
  );
}

function getOtherParticipant(
  chat: Conversation,
  currentUserId: string
): string {
  return (
    chat.participants?.find((id) => id !== currentUserId) || ""
  );
}

function getMessageText(message: ChatMessage): string {
  return message.content ?? message.text ?? "";
}

function getMessageTime(message: ChatMessage): string {
  const value = message.timestamp || message.createdAt;

  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const activeConversationRef = useRef("");
  const activePeerRef = useRef("");

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("chats");
  const [requestFilter, setRequestFilter] =
    useState<RequestFilter>("received");

  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [pendingFriendships, setPendingFriendships] =
    useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [search, setSearch] = useState("");
  const [friendId, setFriendId] = useState("");
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageSending, setMessageSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    if (!notice) return;

    const timeout = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const currentUserId = user?.userId || "";
  const selectedConversationId = selectedChat
    ? getConversationId(selectedChat)
    : "";

  useEffect(() => {
    activeConversationRef.current = selectedConversationId;
    activePeerRef.current = selectedChat
      ? getOtherParticipant(selectedChat, currentUserId)
      : "";
  }, [selectedConversationId, selectedChat, currentUserId]);

  // --------------------------------------------------
  // Read the logged-in user and JWT
  // --------------------------------------------------

  useEffect(() => {
    try {
      const savedToken =
        sessionStorage.getItem("accessToken") ||
        sessionStorage.getItem("token") ||
        "";

      const savedUser =
        sessionStorage.getItem("user") ||
        sessionStorage.getItem("userDetails") ||
        "";

      if (!savedToken || !savedUser) {
        router.replace("/auth/signin");
        return;
      }

      const parsedUser = JSON.parse(savedUser) as User;

      if (!parsedUser.userId) {
        setError("The saved user object does not contain userId.");
        setLoading(false);
        return;
      }

      setToken(savedToken);
      setUser(parsedUser);
    } catch (err) {
      console.error("Session loading error:", err);
      setError("Unable to read your login session. Please sign in again.");
      setLoading(false);
      router.replace("/auth/signin");
    }
  }, [router]);

  // --------------------------------------------------
  // Shared low-level helper
  // Each endpoint below still has its own fetch function.
  // --------------------------------------------------

  const getAuthHeaders = useCallback((): HeadersInit => {
    return {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }, [token]);

  const readResponse = useCallback(
    async (response: Response, endpoint: string): Promise<unknown> => {
      const responseText = await response.text();

      console.log(`[API] ${endpoint}`, {
        status: response.status,
        response: responseText,
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          `${endpoint}: ${response.status}. Check your JWT and backend security configuration.`
        );
      }

      if (!response.ok) {
        throw new Error(
          `${endpoint}: ${response.status} ${responseText || response.statusText}`
        );
      }

      if (!responseText.trim()) return null;

      try {
        return JSON.parse(responseText) as unknown;
      } catch {
        throw new Error(
          `${endpoint} returned a response that is not valid JSON.`
        );
      }
    },
    []
  );

  // --------------------------------------------------
  // 1. GET /api/friends/requests
  // The backend returns incoming requests only.
  // --------------------------------------------------

  const fetchAllRequests = useCallback(async (): Promise<FriendRequest[]> => {
    const endpoint = "/api/friends/requests";

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    const data = await readResponse(response, endpoint);
    const list = getArray<FriendRequest>(data);

    console.log("All friend requests parsed:", list);

    setRequests(list);
    return list;
  }, [getAuthHeaders, readResponse]);

  // --------------------------------------------------
  // 2. GET /api/friends?Status=PENDING
  // This response includes pending relationships in either direction.
  // --------------------------------------------------

  const fetchPendingFriendships =
    useCallback(async (): Promise<FriendRequest[]> => {
      const endpoint = "/api/friends?Status=PENDING";

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      const data = await readResponse(response, endpoint);
      const list = getArray<FriendRequest>(data);

      console.log("Pending friendships parsed:", list);

      setPendingFriendships(list);
      return list;
    }, [getAuthHeaders, readResponse]);

  // --------------------------------------------------
  // 3. GET /api/friends?Status=ACCEPTED
  // Fetch accepted friends.
  // --------------------------------------------------

  const fetchAcceptedFriends = useCallback(async (): Promise<Friend[]> => {
    const endpoint = "/api/friends?Status=ACCEPTED";

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    const data = await readResponse(response, endpoint);
    const list = getArray<Friend>(data);

    console.log("Accepted friends parsed:", list);

    setFriends(list);
    return list;
  }, [getAuthHeaders, readResponse]);

  // --------------------------------------------------
  // 4. GET /api/chats
  // Fetch conversations belonging to the logged-in user.
  // --------------------------------------------------

  const fetchConversations = useCallback(async (): Promise<Conversation[]> => {
    const endpoint = "/api/chats";

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    const data = await readResponse(response, endpoint);
    const list = getArray<Conversation>(data);

    console.log("Conversations parsed:", list);

    setConversations(list);

    setSelectedChat((previous) => {
      if (!previous) return null;

      return (
        list.find(
          (chat) =>
            getConversationId(chat) === getConversationId(previous)
        ) || null
      );
    });

    return list;
  }, [getAuthHeaders, readResponse]);

  // --------------------------------------------------
  // 5. GET /api/chats/{conversationId}/messages
  // Fetch the selected conversation's history.
  // --------------------------------------------------

  const fetchChatHistory = useCallback(
    async (conversationId: string): Promise<ChatMessage[]> => {
      const endpoint =
        `/api/chats/${encodeURIComponent(conversationId)}/messages`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      const data = await readResponse(response, endpoint);
      const list = getArray<ChatMessage>(data);

      console.log("Chat history parsed:", list);
      return list;
    },
    [getAuthHeaders, readResponse]
  );

  const persistMessage = useCallback(
    async (conversationId: string, receiverId: string, content: string) => {
      const endpoint =
        `/api/chats/${encodeURIComponent(conversationId)}/messages`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ receiverId, content }),
      });

      return readResponse(response, endpoint);
    },
    [getAuthHeaders, readResponse]
  );

  // --------------------------------------------------
  // 6. POST /api/friends/requests/{friendId}
  // Send a friend request.
  // --------------------------------------------------

  const postFriendRequest = useCallback(
    async (id: string): Promise<unknown> => {
      const endpoint =
        `/api/friends/requests/${encodeURIComponent(id)}`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      return readResponse(response, endpoint);
    },
    [getAuthHeaders, readResponse]
  );

  // --------------------------------------------------
  // 7. PUT /api/friends/requests/{requestId}/accept
  // --------------------------------------------------

  const putAcceptRequest = useCallback(
    async (requestId: string): Promise<Conversation | null> => {
      const endpoint =
        `/api/friends/requests/${encodeURIComponent(requestId)}/accept`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      const data = await readResponse(response, endpoint);
      return data && typeof data === "object"
        ? (data as Conversation)
        : null;
    },
    [getAuthHeaders, readResponse]
  );

  // --------------------------------------------------
  // 8. PUT /api/friends/requests/{requestId}/reject
  // --------------------------------------------------

  const putRejectRequest = useCallback(
    async (requestId: string): Promise<unknown> => {
      const endpoint =
        `/api/friends/requests/${encodeURIComponent(requestId)}/reject`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });

      return readResponse(response, endpoint);
    },
    [getAuthHeaders, readResponse]
  );

  // --------------------------------------------------
  // 9. POST /api/chats/{userId}
  // Create or retrieve a one-to-one conversation.
  // --------------------------------------------------

  const postCreateConversation = useCallback(
    async (otherUserId: string): Promise<Conversation | null> => {
      const endpoint =
        `/api/chats/${encodeURIComponent(otherUserId)}`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });

      const data = await readResponse(response, endpoint);

      if (!data || typeof data !== "object") return null;

      return data as Conversation;
    },
    [getAuthHeaders, readResponse]
  );

  // --------------------------------------------------
  // Initial dashboard data
  // --------------------------------------------------

  const refreshDashboard = useCallback(async () => {
    setError("");

    const results = await Promise.allSettled([
      fetchAllRequests(),
      fetchPendingFriendships(),
      fetchAcceptedFriends(),
      fetchConversations(),
    ]);

    const errors = results
      .filter(
        (result): result is PromiseRejectedResult =>
          result.status === "rejected"
      )
      .map((result) =>
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason)
      );

    if (errors.length) {
      console.error("Dashboard API errors:", errors);
      setError(errors.join(" | "));
    }
  }, [
    fetchAllRequests,
    fetchPendingFriendships,
    fetchAcceptedFriends,
    fetchConversations,
  ]);

  useEffect(() => {
    if (!token || !user) return;

    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        await refreshDashboard();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [token, user, refreshDashboard]);

  // --------------------------------------------------
  // Socket.IO connection
  // --------------------------------------------------

  
useEffect(() => {
  if (!currentUserId || !token) return;

  const socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    reconnection: true,
  });

  socketRef.current = socket;

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);

    setConnected(true);

    // Register this browser's logged-in user
    socket.emit("REGISTER", currentUserId);

    console.log("REGISTER sent for user:", currentUserId);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    setConnected(false);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection failed:", err.message);
    setConnected(false);
  });

  socket.on(
    "RECEIVE_MESSAGE",
    (payload: {
      senderId: string;
      receiverId: string;
      conversationId: string;
      message: string;
      timestamp?: string;
    }) => {
      console.log("RECEIVE_MESSAGE received:", payload);

      // Update the open chat only if this message belongs to it
      if (
        payload.conversationId &&
        payload.conversationId === activeConversationRef.current
      ) {
        void fetchChatHistory(payload.conversationId)
          .then((history) => {
            setMessages(history);
          })
          .catch((err) => {
            console.error("Failed to reload received messages:", err);
          });
      }

      // Update the conversation list and latest-message preview
      void fetchConversations().catch((err) => {
        console.error("Failed to refresh conversations:", err);
      });
    }
  );

  socket.on("DELIVERY_ERROR", (message: string) => {
    console.error("Message delivery error:", message);
    setError(message);
  });

  return () => {
    socket.removeAllListeners();
    socket.disconnect();
    socketRef.current = null;
  };
}, [
  currentUserId,
  token,
  fetchChatHistory,
  fetchConversations,
]);

  // --------------------------------------------------
  // Load history whenever the selected conversation changes
  // --------------------------------------------------

  useEffect(() => {
    if (!token || !selectedConversationId) {
      setMessages([]);
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      setMessagesLoading(true);
      setError("");

      try {
        const history = await fetchChatHistory(selectedConversationId);

        if (!cancelled) setMessages(history);
      } catch (err) {
        if (!cancelled) {
          setMessages([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load chat history."
          );
        }
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    }

    void loadHistory();

    return () => {
      cancelled = true;
    };
  }, [token, selectedConversationId, fetchChatHistory]);

  // --------------------------------------------------
  // UI actions
  // --------------------------------------------------

  async function sendFriendRequest() {
    const id = friendId.trim();

    if (!id) {
      setError("Enter the user ID of the person you want to add.");
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      await postFriendRequest(id);

      setFriendId("");
      setNotice("Friend request sent successfully");

      await Promise.all([
        fetchAllRequests(),
        fetchPendingFriendships(),
      ]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send friend request."
      );
    } finally {
      setBusyId("");
    }
  }

  async function respondToRequest(
    request: FriendRequest,
    action: "accept" | "reject"
  ) {
    const id = getRequestId(request);

    if (!id) {
      setError("This request has no ID. Check the API response fields.");
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      let acceptedConversation: Conversation | null = null;

      if (action === "accept") {
        acceptedConversation = await putAcceptRequest(id);
        setNotice("Friend request accepted.");
      } else {
        await putRejectRequest(id);
        setNotice("Friend request rejected.");
      }

      await refreshDashboard();

      if (action === "accept" && acceptedConversation) {
        setSelectedChat(acceptedConversation);
        setActiveTab("chats");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Could not ${action} request.`
      );
    } finally {
      setBusyId("");
    }
  }

  async function deleteFriendRequest(request: FriendRequest) {
    const requestId = getRequestId(request);

    if (!requestId) {
      setError("This request has no ID and cannot be deleted.");
      return;
    }

    setBusyId(requestId);
    setError("");
    setNotice("");

    try {
      const endpoint =
        `/api/friends/requests/${encodeURIComponent(requestId)}`;
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      await readResponse(response, endpoint);
      setNotice("Friend request deleted.");
      await refreshDashboard();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete request."
      );
    } finally {
      setBusyId("");
    }
  }

  async function startChat(friend: Friend) {
    const otherUserId =
      friend.friendId ||
      friend.userId ||
      (friend.user1Id === currentUserId
        ? friend.user2Id
        : friend.user1Id) ||
      friend.id ||
      "";

    if (!otherUserId || otherUserId === currentUserId) {
      setError("Could not identify this friend's user ID.");
      return;
    }

    setError("");
    setNotice("");

    try {
      const conversation = await postCreateConversation(otherUserId);

      await fetchConversations();

      if (conversation && getConversationId(conversation)) {
        setSelectedChat(conversation);
      } else {
        setNotice("Conversation loaded. Select it from your chats.");
      }

      setActiveTab("chats");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create conversation."
      );
    }
  }

  async function sendMessage() {
    const socket = socketRef.current;
    const receiverId = selectedChat
      ? getOtherParticipant(selectedChat, currentUserId)
      : "";

    if (!socket?.connected) {
      setError("Socket is disconnected. Please wait for it to reconnect.");
      return;
    }

    if (!selectedChat || !selectedConversationId || !receiverId) {
      setError("Select a valid conversation before sending a message.");
      return;
    }

    const content = messageText.trim();
    if (!content) return;

    setMessageSending(true);

    try {
      const data = await persistMessage(
        selectedConversationId,
        receiverId,
        content
      );

      if (!data || typeof data !== "object") {
        throw new Error("The message API did not return the saved message.");
      }

      const savedMessage = data as ChatMessage;
      socket.emit("SEND_MESSAGE", {
        senderId: currentUserId,
        receiverId,
        conversationId: selectedConversationId,
        message: content,
      });

      setMessages((previous) => [...previous, savedMessage]);
      setMessageText("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send message."
      );
    } finally {
      setMessageSending(false);
    }
  }

  function logout() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userDetails");

    socketRef.current?.disconnect();
    router.replace("/auth/signin");
  }

  // --------------------------------------------------
  // Derived data for the interface
  // --------------------------------------------------

  const incomingRequests = requests.filter(
    (request) => !request.status || request.status.toUpperCase() === "PENDING"
  );

  const incomingRequestIds = new Set(
    incomingRequests.map(getRequestId).filter(Boolean)
  );
  const outgoingRequests = pendingFriendships.filter(
    (request) =>
      !incomingRequestIds.has(getRequestId(request)) &&
      (!request.status || request.status.toUpperCase() === "PENDING")
  );

  const visibleRequests =
    requestFilter === "received"
      ? incomingRequests
      : outgoingRequests;

  const getConversationTitle = (chat: Conversation): string => {
    const otherId = getOtherParticipant(chat, currentUserId);

    return (
      chat.username ||
      chat.name ||
      friends.find((friend) => friend.id === otherId)?.username ||
      otherId ||
      "Conversation"
    );
  };

  const visibleConversations = conversations.filter((chat) => {
    return [
      getConversationTitle(chat),
      chat.lastMessage,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const visibleFriends = friends.filter((friend) => {
    const id =
      friend.friendId ||
      friend.userId ||
      (friend.user1Id === currentUserId
        ? friend.user2Id
        : friend.user1Id) ||
      friend.id ||
      "";

    return (
      id &&
      id !== currentUserId &&
      id.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading && !user) {
    return <div className="dashboard-loading">Loading your dashboard...</div>;
  }

  // --------------------------------------------------
  // Dashboard UI
  // --------------------------------------------------

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">C</div>
          <span>Connect</span>
        </div>

        <div className="profile">
          <div className="avatar">
            {(user?.username || user?.email || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="profile-info">
            <strong>{user?.username || "User"}</strong>
            <span>{user?.email || currentUserId}</span>
          </div>

          <button
            className="icon-button logout-button"
            onClick={logout}
            title="Logout"
            aria-label="Logout"
          >
            ↗
          </button>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "chats" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("chats");
              setSearch("");
              setError("");
            }}
          >
            <span className="nav-icon">◫</span>
            <span>Chats</span>
            <span className="nav-count">{conversations.length}</span>
          </button>

          <button
            className={`nav-item ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("requests");
              setSearch("");
              setError("");
            }}
          >
            <span className="nav-icon">♧</span>
            <span>Requests</span>
            {incomingRequests.length > 0 && (
              <span className="nav-count unread-count">
                {incomingRequests.length}
              </span>
            )}
          </button>

          <button
            className="nav-item disabled-nav"
            disabled
            title="Groups will be added later"
          >
            <span className="nav-icon">◎</span>
            <span>Groups</span>
            <span className="coming-soon">Soon</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <span className={`status-dot ${connected ? "online" : ""}`} />
          {connected ? "Socket connected" : "Socket disconnected"}
        </div>
      </aside>

      <section className="list-panel">
        <header className="panel-header">
          <div>
            <p className="eyebrow">
              {activeTab === "chats" ? "MESSAGES" : "CONNECTIONS"}
            </p>
            <h1>
              {activeTab === "chats" ? "Your chats" : "Friend requests"}
            </h1>
          </div>

          <button
            className="refresh-button"
            onClick={() => void refreshDashboard()}
            title="Refresh"
            aria-label="Refresh"
          >
            ↻
          </button>
        </header>

        {activeTab === "requests" && (
          <form
            className="add-friend-form"
            onSubmit={(event) => {
              event.preventDefault();
              void sendFriendRequest();
            }}
          >
            <input
              value={friendId}
              onChange={(event) => setFriendId(event.target.value)}
              placeholder="Enter a user ID to add..."
              aria-label="Friend user ID"
            />
            <button type="submit" disabled={!friendId.trim() || !!busyId}>
              {busyId === friendId.trim() ? "Adding..." : "Add"}
            </button>
          </form>
        )}

        <div className="search-box">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              activeTab === "chats"
                ? "Search conversations..."
                : "Search user ID..."
            }
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {activeTab === "requests" ? (
          <>
            <div className="filter-tabs">
              <button
                className={requestFilter === "received" ? "selected" : ""}
                onClick={() => setRequestFilter("received")}
              >
                Received <span>{incomingRequests.length}</span>
              </button>

              <button
                className={requestFilter === "sent" ? "selected" : ""}
                onClick={() => setRequestFilter("sent")}
              >
                Sent <span>{outgoingRequests.length}</span>
              </button>
            </div>

            <div className="list-content">
              {loading ? (
                <div className="empty-state">Loading requests...</div>
              ) : visibleRequests.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">♧</div>
                  <strong>No {requestFilter} requests</strong>
                  <p>
                    {requestFilter === "received"
                      ? "New friend requests will appear here."
                      : "Requests you send will appear here."}
                  </p>
                </div>
              ) : (
                visibleRequests
                  .filter((request) => {
                    const otherId = getRequestUserId(request);

                    return (
                      otherId.toLowerCase().includes(search.toLowerCase()) ||
                      (request.username || "")
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    );
                  })
                  .map((request, index) => {
                    const requestId = getRequestId(request);
                    const otherUserId = getRequestUserId(request);

                    return (
                      <article
                        className="request-card"
                        key={requestId || `${otherUserId}-${index}`}
                      >
                        <div className="avatar request-avatar">
                          {(request.senderName ||
                            request.username ||
                            otherUserId ||
                            "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="request-info">
                          <strong>
                            {request.senderName ||
                              request.username ||
                              otherUserId ||
                              "Unknown user"}
                          </strong>
                          <span>{otherUserId}</span>
                          <small>
                            {requestFilter === "received"
                              ? "Wants to connect with you"
                              : "Request sent"}
                          </small>
                        </div>

                        {requestFilter === "received" ? (
                          <div className="request-actions">
                            <button
                              className="accept-button"
                              disabled={!!busyId || !requestId}
                              onClick={() =>
                                void respondToRequest(request, "accept")
                              }
                            >
                              {busyId === requestId ? "..." : "Accept"}
                            </button>

                            <button
                              className="reject-button"
                              disabled={!!busyId || !requestId}
                              onClick={() =>
                                void respondToRequest(request, "reject")
                              }
                            >
                              Reject
                            </button>
                            <button
                              className="reject-button"
                              disabled={!!busyId || !requestId}
                              onClick={() =>
                                void deleteFriendRequest(request)
                              }
                            >
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="pending-label">Pending</span>
                        )}
                      </article>
                    );
                  })
              )}

              <div className="subsection-title">ACCEPTED FRIENDS</div>

              {visibleFriends.map((friend, index) => {
                const id =
                  friend.friendId ||
                  friend.userId ||
                  (friend.user1Id === currentUserId
                    ? friend.user2Id
                    : friend.user1Id) ||
                  friend.id ||
                  "";

                return (
                  <article className="friend-row" key={id || index}>
                    <div className="avatar small-avatar">
                      {(friend.username || id || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="friend-info">
                      <strong>{friend.username || id}</strong>
                      <span>{id}</span>
                    </div>

                    <button
                      className="outline-button"
                      disabled={!id}
                      onClick={() => void startChat(friend)}
                    >
                      Message
                    </button>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="list-content">
            {loading ? (
              <div className="empty-state">Loading conversations...</div>
            ) : visibleConversations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">◫</div>
                <strong>No conversations yet</strong>
                <p>
                  Open Requests and message an accepted friend to get started.
                </p>
                <button
                  className="dark-button"
                  onClick={() => setActiveTab("requests")}
                >
                  Find friends
                </button>
              </div>
            ) : (
              visibleConversations.map((chat) => {
                const id = getConversationId(chat);
                const otherId = getOtherParticipant(chat, currentUserId);
                const conversationTitle = getConversationTitle(chat);
                const active = selectedConversationId === id;

                return (
                  <button
                    className={`conversation-row ${active ? "selected" : ""}`}
                    key={id}
                    onClick={() => {
                      setSelectedChat(chat);
                      setError("");
                    }}
                  >
                    <div className="avatar conversation-avatar">
                      {(conversationTitle || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="conversation-info">
                      <div className="conversation-topline">
                        <strong>
                          {conversationTitle}
                        </strong>
                        <span>
                          {chat.lastMessageAt
                            ? getMessageTime({
                                senderId: "",
                                receiverId: "",
                                timestamp: chat.lastMessageAt,
                              })
                            : ""}
                        </span>
                      </div>

                      <p>{chat.lastMessage || "Start a conversation"}</p>
                      <small>{otherId}</small>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </section>

      <section className="chat-panel">
        {selectedChat ? (
          <>
            <header className="chat-header">
              <div className="avatar chat-avatar">
                {getConversationTitle(selectedChat)
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="chat-header-info">
                <strong>
                  {getConversationTitle(selectedChat)}
                </strong>
                <span>
                  {getOtherParticipant(selectedChat, currentUserId)}
                </span>
              </div>

              <div className="conversation-id">
                <span>CONVERSATION</span>
                <code>{selectedConversationId}</code>
              </div>
            </header>

            <div className="messages-area">
              <div className="chat-date-label">MESSAGES</div>

              {messagesLoading ? (
                <div className="empty-state">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✉</div>
                  <strong>Start the conversation</strong>
                  <p>Your messages will appear here.</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const own = message.senderId === currentUserId;

                  return (
                    <div
                      className={`message-row ${own ? "own-message" : ""}`}
                      key={message.id || `${message.timestamp}-${index}`}
                    >
                      <div className="message-bubble">
                        <p>{getMessageText(message)}</p>
                        <span>{getMessageTime(message)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <form
              className="message-composer"
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage();
              }}
            >
              <input
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                placeholder="Write a message..."
                aria-label="Message"
              />

              <button
                type="submit"
                disabled={!connected || !messageText.trim() || messageSending}
                aria-label="Send message"
              >
                {messageSending ? "Sending..." : "Send"} <span>↗</span>
              </button>
            </form>

            <div className="composer-note">
              Press Enter to send · Messages are sent in real time
            </div>
          </>
        ) : (
          <div className="welcome-panel">
            <div className="welcome-icon">C</div>
            <h2>Your conversations, all in one place.</h2>
            <p>
              Select a chat from the middle panel to start messaging.
              Your private conversations will appear here.
            </p>
            <button
              className="dark-button"
              onClick={() => setActiveTab("requests")}
            >
              Find people
            </button>
          </div>
        )}

        {(error || notice) && (
          <div className={`toast ${error ? "toast-error" : "toast-success"}`}>
            <span>{error || notice}</span>
            <button
              onClick={() => {
                setError("");
                setNotice("");
              }}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
