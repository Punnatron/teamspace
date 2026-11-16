
import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export default function ChatInput({
  onSend,
  disabled
}: ChatInputProps) {

  const [input, setInput] = useState("");

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const message = input.trim();

    if (!message || disabled) {
      return;
    }

    onSend(message);
    setInput("");
  }

  return (
    <div className="chat-composer-wrapper">

      <form
        className="chat-composer"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          placeholder="Ask anything about our team..."
          disabled={disabled}
          aria-label="Type your message"
          autoComplete="off"
        />

        <button
          type="submit"
          disabled={disabled || !input.trim()}
          aria-label="Send message"
        >
          <Send size={19} />
        </button>

      </form>

      <p className="composer-hint">
        Press Enter to send your message
      </p>

    </div>
  );
}
