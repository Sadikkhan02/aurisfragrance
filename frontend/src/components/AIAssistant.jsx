import React, { useState, useEffect, useRef, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";

const AIAssistant = () => {
  const { products, cartItems, backendUrl, currency } = useContext(ShopContext);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Hello there! I'm your Auris AI Stylist. Add items to your cart or ask me anything to get personalized fashion recommendations!",
      recommendedProductIds: []
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Format cart items for AI context
  const getCartDetails = () => {
    const details = [];
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          const item = products.find((p) => p._id === itemId);
          if (item) {
            details.push({
              name: item.name,
              price: item.price,
              category: item.category,
              subCategory: item.subCategory,
              size: size,
              quantity: cartItems[itemId][size]
            });
          }
        }
      }
    }
    return details;
  };

  // Get active cart count
  const cartItemCount = getCartDetails().reduce((acc, curr) => acc + curr.quantity, 0);

  // Send message to backend
  const handleSendMessage = async (userMsgText) => {
    const messageToSend = userMsgText || input;
    if (!messageToSend.trim()) return;

    // Add user message to state
    const updatedMessages = [...messages, { role: "user", text: messageToSend }];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const activeCart = getCartDetails();
      
      // Build history: exclude the current user message (last item) and any
      // leading model messages (like the initial greeting) since Gemini requires
      // history to start with a 'user' role message.
      const allPrevious = updatedMessages.slice(0, -1);
      const firstUserIdx = allPrevious.findIndex((m) => m.role === "user");
      const history = firstUserIdx >= 0
        ? allPrevious.slice(firstUserIdx).map((msg) => ({ role: msg.role, text: msg.text }))
        : [];

      const response = await axios.post(`${backendUrl}/api/ai/assistant`, {
        cartItems: activeCart,
        messageHistory: history,
        userMessage: messageToSend
      });

      if (response.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: response.data.reply,
            recommendedProductIds: response.data.recommendedProductIds || []
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "model",
            text: "I ran into a bit of trouble connecting to my AI core. Is there anything else I can help you find?",
            recommendedProductIds: []
          }
        ]);
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "I couldn't reach the server. Please verify your connection or check if the backend is running.",
          recommendedProductIds: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Proactive greeting on cart changes
  const [lastCartCount, setLastCartCount] = useState(0);
  useEffect(() => {
    if (cartItemCount > 0 && cartItemCount !== lastCartCount && isOpen) {
      setLastCartCount(cartItemCount);
      // Trigger a proactive styling suggestion
      const cartInfo = getCartDetails().map(i => `${i.name} (Size: ${i.size})`).join(", ");
      handleSendMessage(`I just updated my cart. I have: ${cartInfo}. Can you recommend matching items?`);
    }
  }, [cartItemCount, isOpen]);

  // Handle quick option clicks
  const handleQuickAction = (actionText) => {
    handleSendMessage(actionText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 relative cursor-pointer group"
        >
          {/* Glowing pulse ring */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-40 animate-ping group-hover:opacity-60 duration-1000"></span>
          <svg
            className="w-7 h-7 relative z-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
          {/* Badge */}
          {cartItemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">
              {cartItemCount}
            </span>
          )}
        </button>
      )}

      {/* Expanded Assistant Card */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[550px] max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden bg-white/90 backdrop-blur-md border border-white/20 transition-all duration-500 scale-100 origin-bottom-right">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  ✨
                </div>
                {/* Online Indicator pulsing */}
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white animate-pulse"></span>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">Auris AI Stylist</h3>
                <span className="text-xs text-emerald-100">Ready to styled you</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-red-200 transition-colors p-1.5 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, index) => (
              <div key={index} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200/60 rounded-bl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                {/* Render recommended items if returned by AI */}
                {msg.role === "model" && msg.recommendedProductIds && msg.recommendedProductIds.length > 0 && (
                  <div className="mt-3 w-full max-w-[95%]">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                      Recommended Matches
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                      {msg.recommendedProductIds.map((id) => {
                        const product = products.find((p) => p._id === id);
                        if (!product) return null;
                        return (
                          <div
                            key={id}
                            onClick={() => {
                              window.location.href = `/product/${product._id}`;
                              setIsOpen(false);
                            }}
                            className="flex-shrink-0 w-32 bg-white rounded-xl border border-gray-200/80 p-2 shadow-sm hover:shadow-md hover:border-teal-400 transition-all duration-300 cursor-pointer"
                          >
                            <img
                              src={product.image[0]}
                              alt={product.name}
                              className="w-full h-24 object-cover rounded-lg mb-1.5"
                            />
                            <h4 className="text-xs font-semibold text-gray-700 truncate">{product.name}</h4>
                            <p className="text-xs text-teal-600 font-bold mt-0.5">
                              {currency}
                              {product.price}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* AI Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-1.5 bg-white border border-gray-200/60 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm w-16">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-300"></span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions chips */}
          <div className="px-4 py-2 flex gap-1.5 overflow-x-auto bg-gray-50/80 border-t border-gray-100">
            <button
              onClick={() => handleQuickAction("Suggest matching items for my cart")}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer transition-colors"
            >
              👗 Match my cart
            </button>
            <button
              onClick={() => handleQuickAction("What are the best-selling items?")}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer transition-colors"
            >
              🔥 Bestsellers
            </button>
            <button
              onClick={() => handleQuickAction("Suggest cozy clothes for winter")}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-600 cursor-pointer transition-colors"
            >
              ❄️ Winter wear
            </button>
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t bg-white border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask Auris AI Stylist..."
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3.5 py-2 outline-none focus:border-teal-500 transition-colors"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all cursor-pointer"
            >
              <svg
                className="w-5 h-5 transform rotate-90"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;
