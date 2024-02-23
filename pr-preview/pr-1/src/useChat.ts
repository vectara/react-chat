import { useEffect, useRef, useState } from "react";
import { ChatTurn, SearchError, SummaryLanguage } from "types";
import { deserializeSearchResponse } from "utils/deserializeSearchResponse";
import { sendSearchRequest } from "utils/sendSearchRequest";

/**
 * A hook that exposes a data fetcher, message history, loading state, and error state.
 */
export const useChat = (customerId: string, corpusIds: string[], apiKey: string) => {
  const [messageHistory, setMessageHistory] = useState<ChatTurn[]>([]);
  const recentQuestion = useRef<string>("");
  const [recentAnswer, setRecentAnswer] = useState<ChatTurn | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [error, setError] = useState<boolean>(false);
  const getLanguage = (languageValue?: string): SummaryLanguage => (languageValue ?? "auto") as SummaryLanguage;

  const sendMessage = ({ query, isRetry = false }: { query: string; isRetry?: boolean }) => {
    if (isLoading) return;
    recentQuestion.current = query;

    // If this isn't a retry, optimistically add a placeholder entry to the chat history.
    // We'll replace this later on with a copy from the server.
    if (!isRetry) {
      setMessageHistory((messageHistory) => {
        return [
          ...messageHistory,
          {
            id: "0",
            question: query,
            answer: "",
            results: []
          }
        ];
      });
    } else {
      setError(false);
    }

    fetchSearchResults(query);
  };

  const fetchSearchResults = async (query: string, language: SummaryLanguage = getLanguage()) => {
    const baseSearchRequestParams = {
      filter: "",
      queryValue: query,
      rerank: true,
      rerankNumResults: 50,
      rerankerId: 272725718,
      rerankDiversityBias: 0.3,
      hybridNumWords: 2,
      hybridLambdaLong: 0.0,
      hybridLambdaShort: 0.1,
      customerId: customerId,
      corpusId: corpusIds.join(","),
      endpoint: "api.vectara.io",
      apiKey: apiKey
    };

    let initialSearchResponse;

    setIsLoading(true);

    try {
      initialSearchResponse = await sendSearchRequest(baseSearchRequestParams);
    } catch (error) {
      setError(true);
      setIsLoading(false);
      return [];
    }

    if (initialSearchResponse.response.length > 0) {
      try {
        const response = await sendSearchRequest({
          ...baseSearchRequestParams,
          summaryMode: true,
          summaryNumResults: 7,
          summaryNumSentences: 3,
          summaryPromptName: "vectara-summary-ext-v1.2.0",
          language,

          chat: { conversationId }
        });

        setConversationId(response.summary[0].chat.conversationId);
        setRecentAnswer({
          id: response.summary[0].chat.turnId,
          question: recentQuestion.current,
          answer: response?.summary[0].text ?? "",
          results: deserializeSearchResponse(response) ?? []
        });
        setIsLoading(false);
      } catch (error) {
        console.log("Summary error", error);
        setIsLoading(false);
        return;
      }
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!recentAnswer) return;

    // Replace most recent entry with an updated version that includes the answer and turn id from the server.
    // We do this to ensure that our local copy of messages is reflective of what's on the server.
    const updatedHistory = [...messageHistory.slice(0, -1), recentAnswer];

    setMessageHistory(updatedHistory);
  }, [recentAnswer]);

  return {
    sendMessage,
    messageHistory,
    isLoading,
    error
  };
};
