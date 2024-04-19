import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { screen } from "shadow-dom-testing-library";
import { ReactChatbot } from "./";
import * as useChatInterface from "./useChat";

const MIN_PROPS = {
  customerId: "mock-customer-id",
  corpusIds: ["1", "2"],
  apiKey: "mock-api-key"
};

const OPTIONAL_PROPS = {
  title: "mock-title",
  placeholder: "mock-placeholder",
  inputSize: "large" as "large" | "medium",
  emptyStateDisplay: <div>mock-empty-state-display</div>,
  isInitiallyOpen: false,
  zIndex: 9999
};

const MOCK_MESSAGE_HISTORY = [
  {
    answer: "mock-answer",
    id: "mock-turn-id",
    question: "mock-question",
    results: [
      {
        id: "mock-result-id-1",
        metadata: {
          source: "mock-result-1-metadata-source",
          title: "mock-result-1-metadata-title",
          url: "mock-result-1-metadata-url"
        },
        snippet: {
          pre: "mock-result-1-snippet-pre",
          post: "mock-result-1-snippet-post",
          text: "mock-result-1-snippet-text"
        },
        source: "mock-result-1-source",
        title: "mock-result-1-title",
        url: "mock-result-1-url"
      }
    ]
  }
];

window.CSSStyleSheet = jest.fn().mockImplementation(() => ({
  replaceSync: () => {}
}));

describe("ReactChatbot", () => {
  let mockSendMessage: jest.Mock;
  let useChatSpy: jest.SpyInstance;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    useChatSpy = jest.spyOn(useChatInterface, "useChat");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should render in closed state by default", () => {
    useChatSpy.mockImplementation(() => ({
      sendMessage: mockSendMessage,
      messageHistory: []
    }));

    render(<ReactChatbot {...MIN_PROPS} />);

    expect(screen.getByShadowText("My Chatbot")).toBeInTheDocument();
  });

  it("should optionally render in open state", () => {
    useChatSpy.mockImplementation(() => ({
      sendMessage: mockSendMessage,
      messageHistory: []
    }));

    render(<ReactChatbot {...MIN_PROPS} isInitiallyOpen={true} />);

    expect(screen.getByShadowText("Ask anything.")).toBeInTheDocument();
    expect(screen.getByShadowPlaceholderText("Chat with your AI Assistant")).toBeInTheDocument();
  });

  it("should render based on optional parameters", () => {
    useChatSpy.mockImplementation(() => ({
      sendMessage: mockSendMessage,
      messageHistory: []
    }));

    render(<ReactChatbot {...MIN_PROPS} {...OPTIONAL_PROPS} />);
    const openButton = screen.getByShadowText(OPTIONAL_PROPS.title);

    expect(openButton).toBeInTheDocument();

    fireEvent.click(openButton);

    expect(screen.getByShadowText(OPTIONAL_PROPS.title)).toBeInTheDocument();
    expect(screen.getByShadowText("mock-empty-state-display")).toBeInTheDocument();
    expect(screen.getByShadowTestId("queryInput")).toBeInTheDocument();
  });

  it("should render messages", () => {
    useChatSpy.mockImplementation(() => ({
      sendMessage: mockSendMessage,
      messageHistory: MOCK_MESSAGE_HISTORY
    }));

    render(<ReactChatbot {...MIN_PROPS} isInitiallyOpen={true} />);

    expect(screen.getByShadowText("mock-question")).toBeInTheDocument();
    expect(screen.getByShadowText("mock-answer")).toBeInTheDocument();
    expect(screen.getByShadowText("Start new conversation")).toBeInTheDocument();
  });

  it("should execute callback when sending message", () => {
    useChatSpy.mockImplementation(() => ({
      sendMessage: mockSendMessage,
      messageHistory: []
    }));

    render(<ReactChatbot {...MIN_PROPS} isInitiallyOpen={true} />);
    const sendButton = screen.getByShadowText("Send");
    const input = screen.getByShadowTestId("queryInput");

    fireEvent.change(input, { target: { value: "What is RAG?" } });
    fireEvent.submit(input);

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect((input as HTMLInputElement).value).toEqual("");

    fireEvent.change(input, { target: { value: "What is Vectara?" } });
    fireEvent.click(sendButton);

    expect(mockSendMessage).toHaveBeenCalledTimes(2);
    expect((input as HTMLInputElement).value).toEqual("");
  });

  it("renders example questions", () => {
    useChatSpy.mockImplementation(() => ({
      sendMessage: mockSendMessage,
      messageHistory: []
    }));

    render(<ReactChatbot {...MIN_PROPS} exampleQuestions={["What is RAG"]} isInitiallyOpen={true} />);
    const exampleQuestion = screen.getByShadowTestId("exampleQuestion");
    expect(exampleQuestion.textContent).toEqual("What is RAG");

    fireEvent.click(exampleQuestion);
    expect(mockSendMessage).toHaveBeenCalledTimes(1);
  });
});
