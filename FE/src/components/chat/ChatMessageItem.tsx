
import { useEffect, useRef, useState } from "react";

import {
  Bot,
  UserRound,
  Copy,
  Check,
  RotateCcw
} from "lucide-react";

import type { ChatMessage } from "../../types/chat";

interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry?: () => void;
  retryDisabled?: boolean;
}

export default function ChatMessageItem({
  message,
  onRetry,
  retryDisabled = false
}: ChatMessageItemProps) {

  const isUser = message.role === "user";

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copyResetTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyResetTimer.current !== null) {
        window.clearTimeout(copyResetTimer.current);
      }
    };
  }, []);

  const time = new Date(
    message.createdAt
  ).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit"
  });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        message.content
      );

      if (copyResetTimer.current !== null) {
        window.clearTimeout(copyResetTimer.current);
      }

      setCopied(true);
      setCopyError(false);

      copyResetTimer.current = window.setTimeout(() => {
        setCopied(false);
        copyResetTimer.current = null;
      }, 2000);

    } catch (error) {
      console.error("Copy failed:", error);

      if (copyResetTimer.current !== null) {
        window.clearTimeout(copyResetTimer.current);
        copyResetTimer.current = null;
      }

      setCopied(false);
      setCopyError(true);
    }
  }

  return (
    <div
      className={`message-row ${
        isUser
          ? "message-row-user"
          : "message-row-assistant"
      }`}
    >

      {!isUser && (
        <div className="message-avatar">
          <Bot size={18} />
        </div>
      )}

      <div className="message-content">

        {/* Message Information */}
        <div className="message-meta">

          <span>
            {isUser ? "YOU" : "TEAMSPACE AI"}
          </span>

          <time dateTime={message.createdAt}>
            {time}
          </time>

        </div>

        {/* Message Text */}
        <div
          className={`message-bubble ${
            message.isError ? "message-bubble-error" : ""
          }`}
        >
          {message.content}
        </div>

        {message.isError && onRetry && (
          <button
            type="button"
            className="retry-message-button"
            onClick={onRetry}
            disabled={retryDisabled}
          >
            <RotateCcw size={14} />
            Try Again
          </button>
        )}

        {/* Copy Response */}
        {!isUser && (

          <div className="message-actions">

            <button
              type="button"
              className={`copy-message-button ${
                copied ? "copied" : ""
              }`}
              onClick={handleCopy}
              aria-label="Copy AI response"
              title="Copy response"
            >

              {copied ? (
                <>
                  <Check size={14} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}

            </button>

            {copyError && (
              <span className="copy-error">
                Unable to copy. Please try again.
              </span>
            )}

          </div>

        )}

      </div>

      {isUser && (
        <div className="user-message-avatar">
          <UserRound size={17} />
        </div>
      )}

    </div>
  );
}
