
import { useEffect, useRef, useState } from "react";

import {
  Bot,
  Sparkles,
  RotateCcw,
  ArrowDown
} from "lucide-react";

import type { ChatMessage } from "../types/chat";

import ChatMessageItem from "../components/chat/ChatMessageItem";
import ChatInput from "../components/chat/ChatInput";
import TypingIndicator from "../components/chat/TypingIndicator";
import { sendChatMessage } from "../services/chatApi";

// ======================================
// MESSAGE ID GENERATOR
// ======================================

function createMessageId(
  role: "assistant" | "error" | "user"
): string {
  return `${Date.now()}-${role}`;
}

// ======================================
// CREATE WELCOME MESSAGE
// ======================================

function createWelcomeMessage(): ChatMessage {
  return {
    id: `welcome-${Date.now()}`,
    role: "assistant",

    content:
      "Hi! Welcome to TeamSpace. I'm your AI assistant. " +
      "You can ask me about our team members, skills and projects. " +
      "I'm currently running in demo mode using our portfolio data.",

    createdAt: new Date().toISOString()
  };
}

// ======================================
// CHAT HISTORY STORAGE
// ======================================

const CHAT_STORAGE_KEY = "teamspace-chat-history-v1";

// Validate saved message before using it
function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    (item.role === "user" || item.role === "assistant") &&
    typeof item.content === "string" &&
    typeof item.createdAt === "string" &&
    (item.isError === undefined || typeof item.isError === "boolean") &&
    (item.retryText === undefined || typeof item.retryText === "string")
  );
}

// Load conversation from Browser
function loadChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") {
    return [createWelcomeMessage()];
  }

  try {
    const savedMessages = localStorage.getItem(
      CHAT_STORAGE_KEY
    );

    if (!savedMessages) {
      return [createWelcomeMessage()];
    }

    const parsed: unknown = JSON.parse(savedMessages);

    if (!Array.isArray(parsed)) {
      return [createWelcomeMessage()];
    }

    const validMessages = parsed
      .filter(isChatMessage)
      .slice(-100);

    return validMessages.length > 0
      ? validMessages
      : [createWelcomeMessage()];

  } catch (error) {
    console.error("Unable to load chat history:", error);

    return [createWelcomeMessage()];
  }
}

// ======================================
// SUGGESTED QUESTIONS
// ======================================

const suggestedQuestions = [
  "Who are your team members?",
  "What skills does your team have?",
  "Tell me about your projects.",
  "Tell me about your team's tech stack."
];

// ======================================
// CHAT PAGE
// ======================================

export default function ChatPage() {

  // Messages State
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => loadChatHistory()
  );

  // Loading State
  const [isLoading, setIsLoading] = useState(false);

  const messagesContainerRef =
    useRef<HTMLDivElement>(null);

  // Track whether user is near the latest message
  const shouldAutoScrollRef = useRef(true);

  // Show the scroll-to-latest button
  const [showScrollToBottom, setShowScrollToBottom] =
    useState(false);

  // ======================================
  // AUTO SCROLL
  // ======================================

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (!container) return;

    if (shouldAutoScrollRef.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      });

      setShowScrollToBottom(false);

    } else {
      setShowScrollToBottom(true);
    }

  }, [messages, isLoading]);

  // ======================================
  // AUTO SAVE CHAT HISTORY
  // ======================================

  useEffect(() => {
    try {
      const historyToSave = messages.slice(-100);

      localStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(historyToSave)
      );

    } catch (error) {
      console.error(
        "Unable to save chat history:",
        error
      );
    }
  }, [messages]);

  // ======================================
  // HANDLE MESSAGE SCROLL
  // ======================================

  function handleMessagesScroll() {
    const container = messagesContainerRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    const isNearBottom = distanceFromBottom < 80;

    shouldAutoScrollRef.current = isNearBottom;

    setShowScrollToBottom(!isNearBottom);
  }

  function scrollToLatest() {
    const container = messagesContainerRef.current;

    if (!container) return;

    shouldAutoScrollRef.current = true;

    setShowScrollToBottom(false);

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  }

  // ======================================
  // REQUEST AI RESPONSE
  // ======================================

  async function requestReply(question: string) {
    setIsLoading(true);

    try {
      const reply = await sendChatMessage(question);

      const aiMessage: ChatMessage = {
        id: createMessageId("assistant"),
        role: "assistant",
        content: reply,
        createdAt: new Date().toISOString()
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage
      ]);

    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: ChatMessage = {
        id: createMessageId("error"),
        role: "assistant",
        content:
          "We couldn't get a response. " +
          "Please check your connection and try again.",
        createdAt: new Date().toISOString(),

        isError: true,
        retryText: question
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        errorMessage
      ]);

    } finally {
      setIsLoading(false);
    }
  }

  // ======================================
  // SEND MESSAGE
  // ======================================

  async function handleSend(message: string) {
    const text = message.trim();

    if (!text || isLoading) return;

    shouldAutoScrollRef.current = true;
    setShowScrollToBottom(false);

    const userMessage: ChatMessage = {
      id: createMessageId("user"),
      role: "user",
      content: text,
      createdAt: new Date().toISOString()
    };

    setMessages((previousMessages) => [
      ...previousMessages,
      userMessage
    ]);

    await requestReply(text);
  }

  // ======================================
  // RETRY MESSAGE
  // ======================================

  function handleRetry(errorMessage: ChatMessage) {
    if (
      isLoading ||
      !errorMessage.isError ||
      !errorMessage.retryText
    ) {
      return;
    }

    shouldAutoScrollRef.current = true;
    setShowScrollToBottom(false);

    // Remove the previous error message
    setMessages((previousMessages) =>
      previousMessages.filter(
        (message) => message.id !== errorMessage.id
      )
    );

    // Retry the original question
    void requestReply(errorMessage.retryText);
  }

  // ======================================
  // RESET CHAT
  // ======================================

  function handleResetChat() {
    // Prevent resetting while AI is responding
    if (isLoading) return;

    // Ask for confirmation
    const confirmed = window.confirm(
      "Are you sure you want to start a new conversation?"
    );

    if (!confirmed) return;

    // Start a fresh conversation
    setMessages([createWelcomeMessage()]);
  }

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="chat-workspace">

      {/* Page Heading */}

      <div className="chat-page-heading">

        <span className="section-label">
          02 / AI ASSISTANT
        </span>

        <h1>
          Get to know us.
          <br />
          <span>One question away.</span>
        </h1>

        <p>
          Ask anything about our team, members,
          skills and projects.
        </p>

      </div>

      {/* Chat Container */}

      <section
        className="chat-panel"
        aria-labelledby="chat-panel-title"
      >

        {/* Chat Header */}

        <header className="chat-panel-header">

          <div className="chat-brand">

            <div className="chat-brand-icon">
              <Bot size={23} />
            </div>

            <div>
              <strong id="chat-panel-title">TeamSpace AI</strong>

              <span>
                <i className="status-dot"></i>
                Portfolio Assistant
              </span>
            </div>

          </div>

          <div className="chat-header-actions">

            <span className="demo-badge">
              DEMO MODE
            </span>

            <button
              type="button"
              className="reset-chat-button"
              onClick={handleResetChat}
              disabled={isLoading}
              title="Start a new conversation"
              aria-label="Reset conversation"
            >
              <RotateCcw size={17} />
            </button>

          </div>

        </header>

        {/* Message Area */}

        <div
          className="chat-message-list"
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          aria-live="polite"
          aria-relevant="additions"
          aria-busy={isLoading}
          role="log"
          aria-label="Chat conversation"
        >

          {messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              message={message}
              onRetry={
                message.isError
                  ? () => handleRetry(message)
                  : undefined
              }
              retryDisabled={isLoading}
            />
          ))}

          {/* Loading Indicator */}

          {isLoading && <TypingIndicator />}

          {/* Suggested Questions */}

          {messages.length === 1 && !isLoading && (
            <div className="suggested-questions">

              <span>TRY ASKING</span>

              <div className="suggestion-list">

                {suggestedQuestions.map((question) => (
                  <button
                    type="button"
                    key={question}
                    onClick={() => handleSend(question)}
                  >
                    <Sparkles size={14} />
                    {question}
                  </button>
                ))}

              </div>

            </div>
          )}

          {/* SCROLL TO LATEST BUTTON */}

          {showScrollToBottom && (
            <button
              type="button"
              className="scroll-to-latest"
              onClick={scrollToLatest}
              aria-label="Scroll to latest message"
            >
              <ArrowDown size={16} />
              Latest message
            </button>
          )}

        </div>

        {/* Chat Input */}

        <ChatInput
          onSend={handleSend}
          disabled={isLoading}
        />

      </section>

      {/* Notice */}

      <p className="chat-disclaimer">
        Demo Mode · Your conversation is saved
        locally in this browser.
      </p>

    </div>
  );
}
