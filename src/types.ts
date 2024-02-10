import { ChatLanguage } from "./components";

const codeToLanguageMap: Record<ChatLanguage, string> = {
  auto: "Same as query",
  eng: "English",
  deu: "German",
  fra: "French",
  zho: "Chinese",
  kor: "Korean",
  ara: "Arabic",
  rus: "Russian",
  tha: "Thai",
  nld: "Dutch",
  ita: "Italian",
  por: "Portugese",
  spa: "Spanish",
  jpn: "Japanese",
  pol: "Polish",
  tur: "Turkish"
} as const;

export const humanizeLanguage = (language: ChatLanguage): string => {
  return codeToLanguageMap[language];
};

// export type DeserializedSearchResult = {
//   id: string;
//   snippet: {
//     pre: string;
//     text: string;
//     post: string;
//   };
//   source: string;
//   url?: string;
//   title?: string;
//   metadata: Record<string, unknown>;
// };

// export type DocMetadata = {
//   name: string;
//   value: string;
// };

// export type SearchResponse = {
//   document: SearchResponseDoc[];
//   response: SearchResponseResult[];
//   summary: SearchResponseSummary[];
// };

// type SearchResponseDoc = {
//   id: string;
//   metadata: DocMetadata[];
// };

// type SearchResponseResult = {
//   corpusKey: {
//     corpusId: string;
//     customerId: string;
//     dim: string[];
//   };
//   documentIndex: string;
//   resultLength: number;
//   resultOffset: number;
//   score: number;
//   text: string;
// };

// type SearchResponseSummary = {
//   text?: string;
//   status?: string;
// };
