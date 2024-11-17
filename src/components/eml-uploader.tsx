import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AlertCircle, CheckCircle, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useAccount } from "wagmi";

export function EMLUploader({ teePublicKey }: { teePublicKey: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "encrypting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const mutation = useMutation({
    mutationFn: ({
      encryptedEmail,
      address,
    }: {
      encryptedEmail: string;
      address: string;
    }) => {
      return fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ encryptedEmail, address }),
      });
    },
  });
  const account = useAccount();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith(".eml")) {
      setFile(selectedFile);
      setUploadStatus("idle");
      setErrorMessage("");
    } else {
      setFile(null);
      setErrorMessage("Please select a valid .eml file.");
    }
  };

  const encryptEMLForTEE = (emlContent: string) => {
    return emlContent;
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploadStatus("encrypting");
    try {
      const content = await file.text();
      // console.log("Content:", content);
      const encrypted = encryptEMLForTEE(content);

      // Here you would typically send `encrypted` to your backend
      // console.log("Encrypted data:", encrypted);
      mutation.mutate({ encryptedEmail: encrypted, address: account.address });

      setUploadStatus("success");
    } catch (error) {
      console.error("Error encrypting file:", error);
      setUploadStatus("error");
      setErrorMessage("Failed to encrypt the file. Please try again.");
    }
  };

  if (account.status !== "connected") return null;

  return (
    <div className="max-w-md mx-auto p-6 bg-black/50 border border-green-900/50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-green-500">
        Upload EML File
      </h2>
      <div className="mb-4">
        <Input
          type="file"
          accept=".eml"
          onChange={handleFileChange}
          className="bg-black border-green-900/50 text-green-500"
        />
      </div>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <Button
        onClick={handleUpload}
        disabled={!file || uploadStatus === "encrypting"}
        className="w-full bg-green-500 text-black hover:bg-green-400 disabled:bg-green-500/50"
      >
        {uploadStatus === "encrypting" ? (
          <>
            <Upload className="mr-2 h-4 w-4 animate-spin" />
            Encrypting...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload and Encrypt
          </>
        )}
      </Button>
      {uploadStatus === "success" && (
        <p className="mt-4 text-green-500 flex items-center">
          <CheckCircle className="mr-2 h-4 w-4" />
          File encrypted successfully!
        </p>
      )}
      {uploadStatus === "error" && (
        <p className="mt-4 text-red-500 flex items-center">
          <AlertCircle className="mr-2 h-4 w-4" />
          Error encrypting file. Please try again.
        </p>
      )}
    </div>
  );
}
