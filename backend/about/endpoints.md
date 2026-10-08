# Chat Application — Backend API Requirements

## Project Overview

This document contains the REST API endpoints required by the frontend for the Chat Application.

The application contains:

* User registration and login
* OAuth login
* User profiles
* Friends
* Friend requests
* One-to-one chats
* Chat history
* WebSocket-based real-time messaging

---

# 1. AuthController

### Purpose

`AuthController` handles everything related to:

* User registration
* Normal login
* Logout
* OAuth login
* OAuth callback
* Authentication-related information

---

## 1.1 Register User

### Endpoint

```http
POST /api/auth/register
```

### Purpose

Creates a new user account.

### Request Body

```json
{
  "username": "sai",
  "email": "sai@gmail.com",
  "password": "password123"
}
```

### Input Fields

| Field    | Type   | Required | Description                    |
| -------- | ------ | -------- | ------------------------------ |
| username | String | Yes      | User's display/unique username |
| email    | String | Yes      | User email                     |
| password | String | Yes      | User password                  |

### Response

```json
{
  "message": "User registered successfully",
  "userId": "user123"
}
```

---

# 1.2 Login User

### Endpoint

```http
POST /api/auth/login
```

### Purpose

Authenticates a user using email/username and password.

### Request Body

```json
{
  "email": "sai@gmail.com",
  "password": "password123"
}
```

### Response

```json
{
  "accessToken": "JWT_TOKEN",
  "user": {
    "id": "user123",
    "username": "sai",
    "email": "sai@gmail.com"
  }
}
```

### Frontend Usage

After login:

```text
Frontend
   ↓
POST /api/auth/login
   ↓
Spring Boot
   ↓
Validate credentials
   ↓
Generate JWT
   ↓
Frontend receives JWT
   ↓
Frontend uses JWT for protected APIs
```

---

# 1.3 Get Current Logged-in User

### Endpoint

```http
GET /api/auth/me
```

### Purpose

Returns the currently authenticated user's information.

### Headers

```http
Authorization: Bearer JWT_TOKEN
```

### Response

```json
{
  "id": "user123",
  "username": "sai",
  "email": "sai@gmail.com",
  "profileImage": "image-url"
}
```

### Frontend Usage

Useful when the application loads:

```text
User opens application
        ↓
GET /api/auth/me
        ↓
Backend identifies user from JWT
        ↓
Return current user
        ↓
Frontend stores user information
```

---

# 1.4 Logout

### Endpoint

```http
POST /api/auth/logout
```

### Purpose

Logs out the current user.

### Headers

```http
Authorization: Bearer JWT_TOKEN
```

### Response

```json
{
  "message": "Logged out successfully"
}
```

> If JWT is completely stateless, logout can primarily be handled by deleting the token on the frontend. If you implement token revocation/refresh tokens, the backend can invalidate the refresh token here.

---

# 1.5 OAuth Login

OAuth should be handled inside `AuthController` / Spring Security configuration.

For example, Google OAuth:

### Endpoint

```http
GET /oauth2/authorization/google
```

### Purpose

Starts Google OAuth authentication.

### Flow

```text
Frontend
   |
   | GET /oauth2/authorization/google
   ↓
Spring Security
   |
   ↓
Google
   |
   | User logs in
   ↓
Google callback
   |
   ↓
Spring Boot
   |
   ↓
Find/Create User
   |
   ↓
Generate application authentication
   |
   ↓
Frontend
```

---

# 1.6 OAuth Callback

### Endpoint

```http
GET /login/oauth2/code/google
```

### Purpose

Google redirects the user back to this endpoint after authentication.

### Important

This endpoint is normally handled by **Spring Security**, not manually written as a normal controller method.

---

# 1.7 OAuth Providers

If you support multiple OAuth providers:

```text
GET /oauth2/authorization/google
GET /oauth2/authorization/github
```

Additional providers can be added later.

---

# AuthController Endpoint Summary

| Method | Endpoint                       | Purpose            |
| ------ | ------------------------------ | ------------------ |
| POST   | `/api/auth/register`           | Register user      |
| POST   | `/api/auth/login`              | Normal login       |
| GET    | `/api/auth/me`                 | Get logged-in user |
| POST   | `/api/auth/logout`             | Logout             |
| GET    | `/oauth2/authorization/google` | Start Google OAuth |
| GET    | `/login/oauth2/code/google`    | OAuth callback     |

---

# 2. UserController

### Purpose

Handles user-related operations after authentication.

Examples:

* Get user profile
* Search users
* Update profile
* Get another user's profile

---

# 2.1 Get Current User Profile

### Endpoint

```http
GET /api/users/me
```

### Purpose

Returns the current user's profile.

### Headers

```http
Authorization: Bearer JWT_TOKEN
```

### Response

```json
{
  "id": "user123",
  "username": "sai",
  "email": "sai@gmail.com",
  "profileImage": "image-url",
  "bio": "Java Developer"
}
```

---

# 2.2 Get User By ID

### Endpoint

```http
GET /api/users/{userId}
```

### Example

```http
GET /api/users/user456
```

### Purpose

Get another user's public profile.

### Response

```json
{
  "id": "user456",
  "username": "rahul",
  "profileImage": "image-url",
  "bio": "Web Developer"
}
```

---

# 2.3 Search Users

### Endpoint

```http
GET /api/users/search?query=rahul
```

### Purpose

Allows the frontend to search for users.

### Input

```text
query = rahul
```

### Response

```json
[
  {
    "id": "user456",
    "username": "rahul",
    "profileImage": "image-url"
  },
  {
    "id": "user789",
    "username": "rahul123",
    "profileImage": "image-url"
  }
]
```

### Frontend Usage

Useful for:

```text
Search friends
Search users
Send friend request
Start new chat
```

---

# 2.4 Update User Profile

### Endpoint

```http
PUT /api/users/me
```

### Request Body

```json
{
  "username": "sai",
  "bio": "Java Spring Boot Developer",
  "profileImage": "image-url"
}
```

### Response

```json
{
  "message": "Profile updated successfully"
}
```

---

# UserController Endpoint Summary

| Method | Endpoint                   | Purpose                    |
| ------ | -------------------------- | -------------------------- |
| GET    | `/api/users/me`            | Current user's profile     |
| GET    | `/api/users/{userId}`      | Get another user's profile |
| GET    | `/api/users/search?query=` | Search users               |
| PUT    | `/api/users/me`            | Update profile             |

---

# 3. FriendController

### Purpose

Handles:

* Friends
* Friend requests
* Accepting requests
* Rejecting requests
* Removing friends

---

# 3.1 Get Friends

### Endpoint

```http
GET /api/friends
```

### Purpose

Returns the current user's friends.

### Headers

```http
Authorization: Bearer JWT_TOKEN
```

### Response

```json
[
  {
    "id": "user456",
    "username": "rahul",
    "profileImage": "image-url",
    "online": true
  },
  {
    "id": "user789",
    "username": "kiran",
    "profileImage": "image-url",
    "online": false
  }
]
```

### Frontend Usage

Used for the left sidebar:

```text
--------------------------------
| Friends                      |
|                              |
| 🟢 Rahul                     |
| ⚪ Kiran                      |
| 🟢 Arjun                      |
|                              |
--------------------------------
```

---

# 3.2 Send Friend Request

### Endpoint

```http
POST /api/friends/requests
```

### Request Body

```json
{
  "receiverId": "user456"
}
```

### Purpose

Sends a friend request from the logged-in user to another user.

### Flow

```text
Sai
 ↓
POST /api/friends/requests
receiverId = Rahul
 ↓
Backend
 ↓
Create FriendRequest
 ↓
Rahul receives request
```

---

# 3.3 Get Pending Friend Requests

### Endpoint

```http
GET /api/friends/requests
```

### Purpose

Returns incoming pending friend requests.

### Response

```json
[
  {
    "requestId": "request123",
    "sender": {
      "id": "user789",
      "username": "kiran",
      "profileImage": "image-url"
    },
    "status": "PENDING"
  }
]
```

---

# 3.4 Accept Friend Request

### Endpoint

```http
PUT /api/friends/requests/{requestId}/accept
```

### Example

```http
PUT /api/friends/requests/request123/accept
```

### Purpose

Accepts a friend request.

### Result

```text
Friend Request
      ↓
    ACCEPT
      ↓
Friendship created
      ↓
Both users become friends
```

---

# 3.5 Reject Friend Request

### Endpoint

```http
PUT /api/friends/requests/{requestId}/reject
```

### Purpose

Rejects a friend request.

---

# 3.6 Remove Friend

### Endpoint

```http
DELETE /api/friends/{friendId}
```

### Example

```http
DELETE /api/friends/user456
```

### Purpose

Removes an existing friendship.

---

# FriendController Endpoint Summary

| Method | Endpoint                                   | Purpose              |
| ------ | ------------------------------------------ | -------------------- |
| GET    | `/api/friends`                             | Get friends          |
| POST   | `/api/friends/requests`                    | Send friend request  |
| GET    | `/api/friends/requests`                    | Get pending requests |
| PUT    | `/api/friends/requests/{requestId}/accept` | Accept request       |
| PUT    | `/api/friends/requests/{requestId}/reject` | Reject request       |
| DELETE | `/api/friends/{friendId}`                  | Remove friend        |

---

# 4. ChatController

### Purpose

Handles chat/conversation-related REST operations.

The important point is:

**REST is used for loading/storing chat-related data.**

**WebSocket is used for real-time messages.**

---

# 4.1 Get My Conversations

### Endpoint

```http
GET /api/chats
```

### Purpose

Returns all conversations of the logged-in user.

### Response

```json
[
  {
    "chatId": "chat123",
    "otherUser": {
      "id": "user456",
      "username": "rahul",
      "profileImage": "image-url"
    },
    "lastMessage": "Hello Sai",
    "lastMessageTime": "2026-10-01T12:30:00",
    "unreadCount": 2
  }
]
```

### Frontend Usage

This is used to display:

```text
Chats
-------------------------
Rahul
Hello Sai             12:30

Kiran
Where are you?        11:45

Arjun
Okay                  10:20
-------------------------
```

---

# 4.2 Get/Create One-to-One Chat

### Endpoint

```http
POST /api/chats
```

### Request Body

```json
{
  "userId": "user456"
}
```

### Purpose

Creates or retrieves the conversation between the logged-in user and another user.

### Example

Sai wants to chat with Rahul:

```json
{
  "userId": "rahulUserId"
}
```

### Response

```json
{
  "chatId": "chat123",
  "participants": [
    {
      "id": "saiId",
      "username": "sai"
    },
    {
      "id": "rahulId",
      "username": "rahul"
    }
  ]
}
```

---

# 4.3 Get Chat Messages

### Endpoint

```http
GET /api/chats/{chatId}/messages
```

### Example

```http
GET /api/chats/chat123/messages
```

### Purpose

Loads previous messages when the user opens a chat.

### Response

```json
[
  {
    "messageId": "msg1",
    "senderId": "saiId",
    "receiverId": "rahulId",
    "content": "Hi Rahul",
    "timestamp": "2026-10-01T12:00:00"
  },
  {
    "messageId": "msg2",
    "senderId": "rahulId",
    "receiverId": "saiId",
    "content": "Hi Sai",
    "timestamp": "2026-10-01T12:01:00"
  }
]
```

---

# 4.4 Pagination for Messages

Do not load thousands of messages at once.

Use:

```http
GET /api/chats/{chatId}/messages?page=0&size=30
```

or preferably cursor-based pagination later.

### Example

```http
GET /api/chats/chat123/messages?page=0&size=30
```

---

# 4.5 Mark Messages as Read

### Endpoint

```http
PUT /api/chats/{chatId}/read
```

### Purpose

Marks messages in a conversation as read.

### Example

```http
PUT /api/chats/chat123/read
```

---

# ChatController Endpoint Summary

| Method | Endpoint                       | Purpose                    |
| ------ | ------------------------------ | -------------------------- |
| GET    | `/api/chats`                   | Get user's conversations   |
| POST   | `/api/chats`                   | Create/get one-to-one chat |
| GET    | `/api/chats/{chatId}/messages` | Get chat history           |
| PUT    | `/api/chats/{chatId}/read`     | Mark messages as read      |

---

# 5. WebSocket — Real-Time Chat

WebSocket should **not be treated as a normal REST controller endpoint**.

REST:

```text
GET /api/chats/chat123/messages
```

is used to load old messages.

WebSocket:

```text
WebSocket connection
```

is used for real-time communication.

---

# 5.1 WebSocket Connection

Example:

```text
/ws
```

Frontend connects:

```javascript
const socket = new WebSocket(
    "ws://localhost:8080/ws"
);
```

If you use STOMP + SockJS, the structure will be different.

---

# 5.2 Send Message

The frontend sends:

```json
{
  "chatId": "chat123",
  "receiverId": "rahulId",
  "content": "Hello Rahul"
}
```

### WebSocket Flow

```text
Sai Frontend
     |
     | WebSocket
     ↓
Spring Boot
     |
     | Save message
     ↓
MongoDB
     |
     | Send message
     ↓
Rahul Frontend
```

---

# 5.3 Receive Message

Example message received by Rahul:

```json
{
  "messageId": "msg123",
  "chatId": "chat123",
  "senderId": "saiId",
  "receiverId": "rahulId",
  "content": "Hello Rahul",
  "timestamp": "2026-10-01T14:30:00"
}
```

---

# 5.4 WebSocket Events

If you use Socket.IO/STOMP/custom WebSocket, define events/topics for:

```text
SEND_MESSAGE
RECEIVE_MESSAGE
USER_ONLINE
USER_OFFLINE
TYPING
STOP_TYPING
MESSAGE_READ
```

For example:

```text
SEND_MESSAGE
      ↓
Server
      ↓
Save message
      ↓
RECEIVE_MESSAGE
      ↓
Receiver
```

---

# 6. Complete Frontend → Backend Flow

## Login

```text
Frontend
   ↓
POST /api/auth/login
   ↓
JWT
   ↓
Frontend
```

---

## OAuth Login

```text
Frontend
   ↓
/oauth2/authorization/google
   ↓
Google
   ↓
Google Authentication
   ↓
/login/oauth2/code/google
   ↓
Spring Security
   ↓
Application Authentication
   ↓
Frontend
```

---

## Application Startup

```text
Frontend
   ↓
GET /api/auth/me
   ↓
Current User
   ↓
GET /api/friends
   ↓
Friends
   ↓
GET /api/chats
   ↓
Chat List
```

---

## Opening Rahul's Chat

```text
User clicks Rahul
        ↓
POST /api/chats
{
    "userId": "rahulId"
}
        ↓
chatId = chat123
        ↓
GET /api/chats/chat123/messages
        ↓
Old messages displayed
        ↓
WebSocket connection/message subscription
```

---

## Sending Message

```text
Sai
 |
 | "Hello Rahul"
 ↓
WebSocket
 ↓
Spring Boot
 ↓
Save Message → MongoDB
 ↓
Send to Rahul
 ↓
Rahul receives message
```

---

# 7. Recommended Database Collections

For this application, you can use these main MongoDB collections:

```text
users
friends
friend_requests
chats
messages
```

---

## users

Example:

```json
{
  "_id": "user123",
  "username": "sai",
  "email": "sai@gmail.com",
  "password": "hashed-password",
  "profileImage": "image-url",
  "bio": "Java Developer"
}
```

---

## friends

For a friendship between Sai and Rahul:

```json
{
  "_id": "friendship123",
  "userId": "saiId",
  "friendId": "rahulId",
  "createdAt": "2026-10-01T10:00:00"
}
```

---

## friend_requests

```json
{
  "_id": "request123",
  "senderId": "saiId",
  "receiverId": "rahulId",
  "status": "PENDING",
  "createdAt": "2026-10-01T10:00:00"
}
```

---

## chats

```json
{
  "_id": "chat123",
  "type": "PRIVATE",
  "participants": [
    "saiId",
    "rahulId"
  ],
  "createdAt": "2026-10-01T10:00:00",
  "updatedAt": "2026-10-01T14:30:00"
}
```

---

## messages

```json
{
  "_id": "message123",
  "chatId": "chat123",
  "senderId": "saiId",
  "receiverId": "rahulId",
  "content": "Hello Rahul",
  "messageType": "TEXT",
  "timestamp": "2026-10-01T14:30:00",
  "read": false
}
```

---

# 8. Complete API Checklist

## AuthController

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

GET    /oauth2/authorization/google
GET    /login/oauth2/code/google
```

## UserController

```text
GET    /api/users/me
GET    /api/users/{userId}
GET    /api/users/search?query=
PUT    /api/users/me
```

## FriendController

```text
GET    /api/friends
POST   /api/friends/requests
GET    /api/friends/requests
PUT    /api/friends/requests/{requestId}/accept
PUT    /api/friends/requests/{requestId}/reject
DELETE /api/friends/{friendId}
```

## ChatController

```text
GET    /api/chats
POST   /api/chats
GET    /api/chats/{chatId}/messages
PUT    /api/chats/{chatId}/read
```

## WebSocket

```text
/ws

SEND_MESSAGE
RECEIVE_MESSAGE

USER_ONLINE
USER_OFFLINE

TYPING
STOP_TYPING

MESSAGE_READ
```

---

# 9. Overall Architecture

```text
                         FRONTEND
                            |
             +--------------+--------------+
             |              |              |
           REST           OAuth         WebSocket
             |              |              |
             ↓              ↓              ↓
       Spring Boot     Spring Security   WebSocket
             |
    +--------+--------+--------+
    |        |        |        |
    ↓        ↓        ↓        ↓
  Auth     User    Friend     Chat
Controller Controller Controller Controller
    |        |        |        |
    +--------+--------+--------+
             |
          Services
             |
       Repositories
             |
          MongoDB
             |
    +--------+--------+--------+
    |        |        |        |
  users   friends   chats   messages
```

---

# 10. Implementation Order

Build the project in this order:

### Step 1 — User

```text
users collection
        ↓
User entity
        ↓
UserRepository
        ↓
UserService
        ↓
UserController
```

### Step 2 — Authentication

```text
Register
Login
JWT
Spring Security
```

### Step 3 — OAuth

```text
Google OAuth
        ↓
Find existing user
        ↓
Create user if necessary
        ↓
Authenticate user
```

### Step 4 — Friends

```text
Friend request
       ↓
Accept / Reject
       ↓
Friendship
```

### Step 5 — Chats

```text
Create/Get chat
       ↓
Chat collection
       ↓
Load messages
```

### Step 6 — WebSocket

```text
Connect
   ↓
Send message
   ↓
Save message
   ↓
Deliver message
   ↓
Read status
   ↓
Typing status
```

### Step 7 — Frontend Integration

```text
Login
 ↓
Friends
 ↓
Chat List
 ↓
Open Chat
 ↓
Load Old Messages
 ↓
Connect WebSocket
 ↓
Real-time Messaging
```

---

# Important Separation

Keep this rule in your project:

```text
REST API
   ↓
Authentication
User data
Friend data
Chat list
Chat history
Read status

WebSocket
   ↓
Real-time messages
Online/offline
Typing
Message delivery
Read events
```

So when Sai opens Rahul's chat:

```text
GET /api/chats
        ↓
Find Rahul
        ↓
POST /api/chats
        ↓
Get chatId
        ↓
GET /api/chats/{chatId}/messages
        ↓
Display old messages
        ↓
WebSocket
        ↓
Real-time messages
```

This gives you a clean separation between **persistent data operations through REST** and **real-time communication through WebSocket**.
