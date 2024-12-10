import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { amplifyClient } from "@/app/amplify-utils";

// Types
type Message = {
  role: string;
  content: { text: string }[];
};

type Conversation = Message[];

export function Chat() {
  const [conversation, setConversation] = useState<Conversation>([]);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const message = setNewUserMessage();
      fetchChatResponse(message);
    }
  };

  const fetchChatResponse = async (message: Message) => {
    setInputValue("");
    setIsLoading(true);

    try {
      const { data, errors } = await amplifyClient.queries.chat({
        conversation: JSON.stringify([...conversation, message]),
      });

      if (!errors && data) {
        setConversation((prevConversation) => [
          ...prevConversation,
          JSON.parse(data),
        ]);
      } else {
        throw new Error(errors?.[0].message || "An unknown error occurred.");
      }
    } catch (err) {
      setError((err as Error).message);
      console.error("Error fetching chat response:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const lastMessage = conversation[conversation.length - 1];
    console.log("lastMessage", lastMessage);
    (
      messagesRef.current as HTMLDivElement | null
    )?.lastElementChild?.scrollIntoView();
  }, [conversation]);

  const setNewUserMessage = (): Message => {
    const newUserMessage: Message = {
      role: "user",
      content: [{ text: inputValue }],
    };
    setConversation((prevConversation) => [
      ...prevConversation,
      newUserMessage,
    ]);

    setInputValue("");
    return newUserMessage;
  };

  return (
    <div className="chat-container">
      <div className="messages" ref={messagesRef}>
        {conversation.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            {msg.content[0].text}
          </div>
        ))}
      </div>
      {isLoading && (
        <div className="loader-container">
          <p>Thinking...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="input-container">
        <input
          name="prompt"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="input"
          type="text"
        />
        <button
          type="submit"
          className="send-button"
        >
          {isLoading ? "Sending..." : "Send"}
        </button>
      </form>

      {error ? <div className="error-message">{error}</div> : null}
    </div>
  );
}

export default Chat;