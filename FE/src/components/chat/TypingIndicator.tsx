
import { Bot } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="message-row message-row-assistant">

      <div className="message-avatar">
        <Bot size={18} />
      </div>

      <div className="typing-content">

        <span className="typing-label">
          TEAMSPACE AI IS THINKING
        </span>

        <div className="typing-bubble">
          <span></span>
          <span></span>
          <span></span>
        </div>

      </div>

    </div>
  );
}
