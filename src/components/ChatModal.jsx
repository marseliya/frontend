import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { getSocket } from "../socket";

const ChatModal = ({ orderId, userId, driverId, orderStatus, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = getSocket();

  // Ambil riwayat pesan
  const fetchMessages = async () => {
    try {
      const res = await api.get(`/api/messages/${orderId}`);
      setMessages(res.data.data || []);
    } catch (err) {
      console.error("Gagal ambil pesan:", err);
    } finally {
      setLoading(false);
    }
  };

  // Kirim pesan
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (orderStatus !== "dikirim") {
      alert("Chat hanya bisa dilakukan saat pesanan dalam status dikirim");
      return;
    }

    setSending(true);
    try {
      const res = await api.post("/api/messages/send", {
        order_id: orderId,
        message: newMessage
      });

      const sentMessage = res.data.data;
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage("");

      // Emit via socket untuk real-time
      socket.emit("send-message", {
        order_id: orderId,
        message: newMessage,
        sender_id: userId,
        receiver_id: driverId,
        sender_name: sentMessage.sender_name
      });
    } catch (err) {
      console.error("Gagal kirim pesan:", err);
      alert(err.response?.data?.message || "Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  // Socket listener untuk pesan baru
  useEffect(() => {
    fetchMessages();

    // Join ke room order
    socket.emit("join-order", orderId);

    // Listen pesan baru
    const handleNewMessage = (data) => {
      if (data.order_id === orderId) {
        fetchMessages(); // refresh messages
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("order-message", handleNewMessage);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("order-message", handleNewMessage);
    };
  }, [orderId]);

  // Scroll ke bawah setiap messages berubah
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format waktu
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-md bg-white dark:bg-zinc-550 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-xl flex flex-col text-white" style={{ height: "500px", color: "#ffffff" }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-600">
          <h3 className="text-sm font-semibold text-white">
            Chat - Pesanan #{orderId}
          </h3>
          <button onClick={onClose} className="text-white hover:opacity-80 text-xl">
            ×
          </button>
        </div>

        {/* Order status info */}
        <div className="px-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-700 border-b border-zinc-200 dark:border-zinc-700 text-white" >
          Status: <span className="font-semibold text-white">{orderStatus}</span>
          {orderStatus !== "dikirim" && (
            <span className="text-red-400 dark:text-amber-300 font-medium ml-2">(Chat tidak aktif)</span>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-zinc-500">
          {loading ? (
            <div className="text-center text-white text-sm opacity-70">Memuat pesan...</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-white text-sm opacity-70">Belum ada pesan</div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-lg text-white ${
                    msg.sender_id === userId
                      ? "bg-blue-500 rounded-br-none"
                      : "bg-zinc-400 dark:bg-zinc-800 rounded-bl-none"
                  }`}
                >
                  <p className="text-xs font-semibold mb-0.5 text-white">
                    {msg.sender_name}
                  </p>
                  <p className="text-sm wrap-break-word text-white">{msg.message}</p>
                  <p className={`text-[10px] mt-1 text-white opacity-75`}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-3 flex gap-2 bg-white dark:bg-zinc-600">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder={orderStatus === "dikirim" ? "Tulis pesan..." : "Chat tidak aktif"}
            disabled={orderStatus !== "dikirim" || sending}
            className="flex-1 px-3 py-2 text-sm border border-zinc-300 dark:border-zinc-700 bg-transparent rounded-lg focus:outline-none focus:border-blue-500 disabled:opacity-50 text-white placeholder:text-white placeholder:opacity-60"
          />
          <button
            onClick={sendMessage}
            disabled={orderStatus !== "dikirim" || sending || !newMessage.trim()}
            className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
          >
            {sending ? "..." : "Kirim"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;

