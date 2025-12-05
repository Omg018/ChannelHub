"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axios from "axios";
import { io } from "socket.io-client";
import { useRouter } from "next/navigation";

export default function InterfacePage() {
    const [activeChannel, setActiveChannel] = useState<any>(null);
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [channels, setChannels] = useState<any[]>([]);
    const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
    const [newChannelName, setNewChannelName] = useState("");
    const [socket, setSocket] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [channelMembers, setChannelMembers] = useState<any[]>([]);
    const [showMembersSidebar, setShowMembersSidebar] = useState(false);

    useEffect(() => {
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000");
        setSocket(newSocket);

        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/auth/login");
            return;
        }

        if (token) {
            axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/verify`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then((res) => {
                setUser(res.data);
                newSocket.emit("user_connected", res.data._id);
            }).catch(err => {
                console.error(err);
                localStorage.removeItem("token");
                router.push("/auth/login");
            });
        }

        newSocket.on("update_online_users", (users: string[]) => {
            setOnlineUsers(users);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        fetchChannels();
    }, []);

    const fetchChannels = async () => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/channels/all`);
            setChannels(res.data);
            if (res.data.length > 0 && !activeChannel) {
                setActiveChannel(res.data[0]);
            }
        } catch (err) {
            console.error("Error fetching channels:", err);
        }
    };

    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (page === 1) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, page]);

    const prevScrollHeightRef = useRef<number>(0);

    React.useLayoutEffect(() => {
        if (page > 1 && messagesContainerRef.current && prevScrollHeightRef.current) {
            const newScrollHeight = messagesContainerRef.current.scrollHeight;
            const diff = newScrollHeight - prevScrollHeightRef.current;
            messagesContainerRef.current.scrollTop = diff;
            prevScrollHeightRef.current = 0;
        }
    }, [messages, page]);

    const handleScroll = async () => {
        if (messagesContainerRef.current && messagesContainerRef.current.scrollTop === 0 && hasMore && !isFetching) {
            prevScrollHeightRef.current = messagesContainerRef.current.scrollHeight;
            setIsFetching(true);
            await fetchMessages(page + 1);
            setIsFetching(false);
        }
    };

    const fetchMessages = async (pageNum: number) => {
        try {
            const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/messages/${activeChannel._id}?page=${pageNum}&limit=50`);
            const mappedMessages = res.data.map((msg: any) => ({
                id: msg._id,
                content: msg.content,
                senderid: msg.senderid,
                user: msg.senderName || "Unknown",
                avatar: msg.senderAvatar,
                time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timestamp: msg.timestamp
            }));

            if (mappedMessages.length < 50) {
                setHasMore(false);
            }

            if (pageNum === 1) {
                setMessages(mappedMessages);
            } else {
                setMessages(prev => [...mappedMessages, ...prev]);
            }
            setPage(pageNum);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    useEffect(() => {
        if (socket && activeChannel) {
            socket.emit("join_channel", activeChannel._id);
            setPage(1);
            setHasMore(true);
            setMessages([]);

            fetchMessages(1);

            const fetchMembers = async () => {
                try {
                    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/channels/${activeChannel._id}/members`);
                    setChannelMembers(res.data);
                } catch (err) {
                    console.error("Error fetching members:", err);
                }
            };
            fetchMembers();
        }
    }, [activeChannel, socket]);

    useEffect(() => {
        if (socket) {
            socket.on("receive_message", (data: any) => {
                setMessages((prev) => [...prev, data]);
            });

            socket.on("message_deleted", (messageId: string) => {
                setMessages((prev) => prev.filter(msg => msg.id !== messageId));
            });

            socket.on("channel_added", (newChannel: any) => {
                setChannels((prev) => [...prev, newChannel]);
            });
        }
    }, [socket]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !user || !activeChannel) return;

        const messageData = {
            content: messageInput,
            channelId: activeChannel._id,
            senderid: user._id,
            senderName: user.username,
            senderAvatar: user.img,
            user: user.username,
            avatar: user.img,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date(),
        };

        try {
            await socket.emit("send_message", messageData);
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/messages/send`, {
                content: messageInput,
                channelId: activeChannel._id,
                senderid: user._id,
                senderName: user.username,
                senderAvatar: user.img,
                timestamp: new Date(),
            });
            setMessages((prev) => [...prev, messageData]);
            setMessageInput("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleCreateChannel = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChannelName.trim() || !user) return;

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/channels/create`, {
                name: newChannelName,
                creatorid: user._id
            });
            setChannels([...channels, res.data]);
            socket.emit("channel_created", res.data);
            setNewChannelName("");
            setShowCreateChannelModal(false);
            setActiveChannel(res.data);
        } catch (err) {
            console.error("Error creating channel:", err);
        }
    };

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm("Are you sure you want to delete this message?")) return;

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/messages/${messageId}`);
            socket.emit("delete_message", { channelId: activeChannel._id, messageId });
            setMessages((prev) => prev.filter(msg => msg.id !== messageId));
        } catch (err) {
            console.error("Error deleting message:", err);
        }
    };

    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans">
            <aside className="w-80 bg-[#121212] border-r border-gray-800 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-gray-800 ">
                    <Link href="/">
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 flex flex-row items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            ChannelHub
                        </h1>
                    </Link>
                </div>
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                    <div>
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Channels
                            </h2>
                            <button
                                onClick={() => setShowCreateChannelModal(true)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                        <div className="space-y-1">
                            {channels.map((channel) => (
                                <div
                                    key={channel._id}
                                    onClick={() => setActiveChannel(channel)}
                                    className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${activeChannel?._id === channel._id
                                        ? 'bg-blue-600/10 text-blue-400'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="text-lg">#</span>
                                        <span className="truncate">{channel.name}</span>
                                    </div>
                                    {channel.members && (
                                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                                            {channel.members.length}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-black/20 border-t border-gray-800">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-bold overflow-hidden">
                                <img src={user.img} alt={user.username} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="text-sm font-medium text-white truncate">{user.username}</h3>
                                <p className="text-xs text-green-500 truncate flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 animate-pulse">
                            <div className="w-10 h-10 rounded-full bg-gray-800"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-800 rounded w-20"></div>
                                <div className="h-2 bg-gray-800 rounded w-12"></div>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            <main className="flex-1 flex flex-col bg-black relative">
                <header className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <span className="text-gray-500 text-xl">#</span>
                            {activeChannel?.name || "Select a Channel"}
                        </h2>
                    </div>
                    {activeChannel && (
                        <button
                            onClick={() => setShowMembersSidebar(!showMembersSidebar)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </button>
                    )}
                </header>

                {activeChannel && user && !activeChannel.members?.includes(user._id) ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl text-gray-400">#</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Welcome to #{activeChannel.name}!</h2>
                        <p className="text-gray-400 text-center max-w-md">
                            This is the start of the <span className="font-semibold text-white">#{activeChannel.name}</span> channel. Join to start chatting!
                        </p>
                        <button
                            onClick={async () => {
                                try {
                                    const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/channels/join`, {
                                        channelId: activeChannel._id,
                                        userId: user._id
                                    });
                                    setActiveChannel(res.data);
                                    setChannels(prev => prev.map(c => c._id === res.data._id ? res.data : c));
                                } catch (err) {
                                    console.error("Error joining channel:", err);
                                }
                            }}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-blue-500/20"
                        >
                            Join Channel
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-1 overflow-hidden">
                        <div className="flex-1 flex flex-col">
                            <div
                                ref={messagesContainerRef}
                                onScroll={handleScroll}
                                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
                            >
                                {messages.map((msg, index) => (
                                    <div key={index} className="flex gap-4 group relative">
                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-300 overflow-hidden">
                                            {msg.avatar ? <img src={msg.avatar} alt="avatar" className="w-full h-full object-cover" /> : msg.user?.[0]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="font-semibold text-white hover:underline cursor-pointer">
                                                    {msg.user}
                                                </span>
                                                <span className="text-xs text-gray-500">{msg.time}</span>
                                            </div>
                                            <p className="text-gray-300 leading-relaxed">
                                                {msg.content}
                                            </p>
                                        </div>
                                        {user && (msg.senderid === user._id || msg.user === user.username) && (
                                            <button
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Delete Message"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>


                            <div className="p-6 pt-2">
                                <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all">
                                    <form onSubmit={handleSendMessage}>
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder={`Message #${activeChannel?.name || "..."}`}
                                            className="w-full bg-transparent text-white px-4 py-3 focus:outline-none placeholder-gray-500"
                                            disabled={!activeChannel}
                                        />
                                        <div className="flex items-center justify-between px-2 pt-2 border-t border-gray-800 mt-2">
                                            <div className="flex items-center gap-2">

                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!messageInput || !activeChannel}
                                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                </svg>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>


                        {showMembersSidebar && (
                            <aside className="w-64 bg-[#121212] border-l border-gray-800 flex flex-col">
                                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                                    <h3 className="text-lg font-bold text-white">Members</h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {channelMembers.map((member) => (
                                        <div key={member._id} className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden">
                                                    <img src={member.img} alt={member.username} className="w-full h-full object-cover" />
                                                </div>
                                                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#121212] ${onlineUsers.includes(member._id) ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                                            </div>
                                            <span className="text-gray-300 text-sm">{member.username}</span>
                                        </div>
                                    ))}
                                </div>
                            </aside>
                        )}
                    </div>
                )}
            </main>


            {showCreateChannelModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 w-96 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Create New Channel</h3>
                        <form onSubmit={handleCreateChannel}>
                            <input
                                type="text"
                                value={newChannelName}
                                onChange={(e) => setNewChannelName(e.target.value)}
                                placeholder="Channel Name (e.g. general)"
                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white mb-4 focus:outline-none focus:border-blue-500"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateChannelModal(false)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newChannelName.trim()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
                                >
                                    Create Channel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
