"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // Use NextAuth session
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Link as LinkIcon } from "lucide-react";
import ProfileLayout from "@/components/layout";

interface LinkData {
  id?: string;
  userId: string;
  url: string;
  text: string;
}

export default function LinksSection() {
  const { data: session } = useSession(); 
  const [links, setLinks] = useState<LinkData[]>([]);
  const [newLink, setNewLink] = useState<{ url: string; text: string }>({
    url: "",
    text: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id; 

  useEffect(() => {
    const fetchLinks = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/portfolio/links`);
        if (!response.ok) {
          throw new Error("Failed to fetch links");
        }
        const fetchedLinks = await response.json();
        setLinks(fetchedLinks);
      } catch (err) {
        console.error("Failed to fetch links", err);
        setError("Could not load existing links");
      }
    };

    fetchLinks();
  }, [userId]);

  const addLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLink.url && newLink.text && userId) {
      setIsLoading(true);
      try {
        const formattedLink = {
          userId,
          url: newLink.url.startsWith("http")
            ? newLink.url
            : `https://${newLink.url}`,
          text: newLink.text,
        };

        const response = await fetch("/api/portfolio/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedLink),
        });

        if (!response.ok) {
          throw new Error("Failed to add link");
        }

        const addedLink = await response.json();
        setLinks([...links, addedLink]);
        setNewLink({ url: "", text: "" });
      } catch (err) {
        console.error("Error adding link", err);
        setError("Could not add link");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const removeLink = async (linkToRemove: LinkData) => {
    try {
      const response = await fetch(
        `/api/portfolio/links?linkId=${linkToRemove.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete link");
      }

      setLinks(links.filter((link) => link.id !== linkToRemove.id));
    } catch (err) {
      console.error("Error removing link", err);
      setError("Could not remove link");
    }
  };

  return (
    <ProfileLayout>
      <Card>
        <CardHeader>
          <CardTitle>Important Links</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addLink} className="space-y-4">
            <div className="grid lg:grid-cols-2  gap-2">
              <div>
                <Label>URL</Label>
                <Input
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="Enter website URL"
                />
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  value={newLink.text}
                  onChange={(e) =>
                    setNewLink((prev) => ({ ...prev, text: e.target.value }))
                  }
                  placeholder="Link title"
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <Plus className="mr-2 h-4 w-4" />{" "}
              {isLoading ? "Adding..." : "Add Link"}
            </Button>
          </form>

          {links.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium">Current Links</h3>
              {links?.map((link) => (
                <div
                  key={link?.id}
                  className="flex justify-between items-center bg-gray-100 p-2 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <LinkIcon className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">{link?.text}</p>
                      <a
                        href={link?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {link?.url}
                      </a>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLink(link)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm mt-2">{error}</div>
          )}
        </CardContent>
      </Card>
    </ProfileLayout>
  );
}
