"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Send,
  Terminal,
  Shield,
  Users,
  Check,
  X,
} from "lucide-react";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useQuery } from "@tanstack/react-query";
import { EMLUploader } from "@/components/eml-uploader";
import { useAccount } from "wagmi";
import { useAttestations } from "./hooks/useAttestations";

type Message = {
  id: number;
  text: string;
  sender: string;
  timestamp: string;
};

type Community = {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  memberCount: number;
  messages: Message[];
};

const initialCommunities: Community[] = [
  {
    id: "ethglobal",
    name: "ETHGlobal Hacker",
    description: "Discuss emerging tech, cryptocurrency, and digital privacy",
    requirements: ["Has verified email from ETHGlobal"],
    memberCount: 1337,
    messages: [],
  },
  // {
  //   id: "science",
  //   name: "Science",
  //   description: "Share and explore scientific discoveries and theories",
  //   requirements: ["Has verified email from ETHGlobal"],
  //   memberCount: 892,
  //   messages: [],
  // },
  // {
  //   id: "philosophy",
  //   name: "Philosophy",
  //   description: "Explore consciousness, reality, and existence",
  //   requirements: ["Has verified email from ETHGlobal"],
  //   memberCount: 456,
  //   messages: [],
  // },
];

const processPaddedAddress = (paddedAddress: string) => {
  return "0x" + paddedAddress.substring(26, 66);
};

export default function Component() {
  const [communities, setCommunities] =
    useState<Community[]>(initialCommunities);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );
  const [messageInput, setMessageInput] = useState("");
  const { data: teePublicKey, isPending } = useQuery({
    queryKey: ["teePublicKey"],
    queryFn: async () => {
      const res = await fetch("/api/get-public-key");
      const json = await res.json();
      return json.publicKey;
    },
  });
  const account = useAccount();
  const { data, isLoading, error } = useAttestations();

  // Mock function to check if a requirement is met
  // @ts-ignore: Unreachable code error
  const isRequirementMet = (attestations) => {
    if (attestations === undefined) return false;
    // @ts-ignore: Unreachable code error
    return attestations.some((attestation) => {
      const processedData = processPaddedAddress(
        attestation.data,
      ).toLowerCase();
      const accountAddr = account.address?.toLowerCase();

      console.log({
        processedData,
        accountAddr,
        processedDataLength: processedData.length,
        accountAddrLength: accountAddr?.length,
        areEqual: processedData === accountAddr,
        // Also log the raw values before processing
        rawData: attestation.data,
        rawAccount: account.address,
      });

      return processedData === accountAddr;
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() && selectedCommunity) {
      const newMessage: Message = {
        id: Date.now(),
        text: messageInput.trim(),
        sender: "Anonymous#" + Math.floor(Math.random() * 9999),
        timestamp: new Date().toLocaleTimeString(),
      };
      setCommunities(
        communities.map((community) =>
          community.id === selectedCommunity.id
            ? { ...community, messages: [...community.messages, newMessage] }
            : community,
        ),
      );
      setMessageInput("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500">
      <header className="border-b border-green-900/50 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-6 w-6" />
            <span className="font-mono text-xl font-bold">
              Anonymous Social
            </span>
          </div>
          <DynamicWidget />
        </div>
      </header>

      {account.status === "connected" && (
        <main className="container mx-auto p-4 max-w-4xl space-y-8">
          {selectedCommunity ? (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setSelectedCommunity(null)}
                className="mb-4 text-green-500 hover:bg-green-500/20"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Communities
              </Button>

              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold font-mono">
                  {selectedCommunity.name}
                </h2>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4" />
                  <span>End-to-end encrypted</span>
                </div>
              </div>

              <ScrollArea className="h-[60vh] border border-green-900/50 rounded-md bg-black/50 p-4">
                {selectedCommunity.messages.length === 0 ? (
                  <div className="text-center text-green-500/50 py-8">
                    No messages yet. Be the first to send one.
                  </div>
                ) : (
                  selectedCommunity.messages.map((message) => (
                    <div
                      key={message.id}
                      className="mb-4 p-3 border border-green-900/50 rounded-md bg-green-500/5"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm">
                          {message.sender}
                        </span>
                        <span className="text-xs text-green-500/50">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className="text-white">{message.text}</p>
                    </div>
                  ))
                )}
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-grow bg-black border-green-900/50 text-white placeholder:text-green-500/50"
                />
                <Button
                  type="submit"
                  className="bg-green-500 text-black hover:bg-green-400"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </form>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold font-mono mb-4">
                  Welcome to the Darknet
                </h1>
                <p className="text-green-500/70">
                  Join anonymous communities. Share ideas freely. Stay secure.
                </p>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-4">
                {communities.map((community) => (
                  <AccordionItem
                    value={community.id}
                    key={community.id}
                    className="border border-green-900/50 rounded-lg bg-black/50 px-4"
                  >
                    <AccordionTrigger className="hover:text-green-400">
                      <div className="flex items-center gap-4">
                        <span className="font-mono">{community.name}</span>
                        <div className="flex items-center gap-1 text-xs text-green-500/50">
                          <Users className="h-3 w-3" />
                          <span>{community.memberCount}</span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="mb-4 text-green-500/70">
                        {community.description}
                      </p>
                      <ul className="mb-4 space-y-2">
                        {community.requirements.map((requirement) => {
                          const isMet = isRequirementMet(data?.rows);
                          return (
                            <li
                              key={requirement}
                              className="flex items-center gap-2"
                            >
                              {isMet ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                              <span
                                className={
                                  isMet
                                    ? "text-green-500/70"
                                    : "text-red-500/70"
                                }
                              >
                                {requirement}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                      <Button
                        onClick={() => setSelectedCommunity(community)}
                        className="bg-green-500 text-black hover:bg-green-400"
                      >
                        Join Chat
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          )}
          {!isPending && <EMLUploader teePublicKey={teePublicKey} />}
        </main>
      )}
    </div>
  );
}
