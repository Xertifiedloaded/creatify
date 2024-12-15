"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import DashBoardHeading from "@/sections/DashBoardHeading";
import DashBoardSkills from "@/sections/DashBoardSkills";
import ProfileLayout from "@/components/layout";
import { useSession } from "next-auth/react";

interface Profile {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  hobbies?: string[];
  languages?: string[];
  createdAt?: string;
  updatedAt?: string;
  picture?: string;
  [key: string]: any; 
}

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!session?.user?.id) return;

        const response = await fetch(`/api/portfolio/profile?userId=${session.user.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setProfile(null);
          } else {
            throw new Error("Failed to fetch profile");
          }
        } else {
          const data: Profile = await response.json();
          setProfile(data);
        }
      } catch (err) {
        setError((err as Error).message || "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [session?.user?.id]);

  const excludedFields: string[] = ["id", "userId", "createdAt", "updatedAt", "picture"];

  const isValueEmpty = (value: any): boolean =>
    !value ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "string" && !value.trim());

  return (
    <ProfileLayout>
      <div className="space-y-6">
        <DashBoardHeading />
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-700">
              {error ? (
                <p className="text-red-500">{error}</p>
              ) : isLoading ? (
                <p>Loading...</p>
              ) : profile === null ? (
                <div className="text-center text-gray-500">
                  <p>No profile found for this user. Please complete your profile.</p>
                </div>
              ) : (
                Object.keys(profile)
                  .filter((key) => !excludedFields.includes(key))
                  .map((key) => (
                    <React.Fragment key={key}>
                      <div className="flex items-center space-x-2">
                        <p className="font-semibold capitalize flex-grow">{key.replace(/([A-Z])/g, " $1")}</p>
                        <Link href="/profile/details">
                          <ExternalLink
                            className={`w-5 h-5 ${
                              isValueEmpty(profile[key]) ? "text-red-500" : "text-green-500"
                            } transition-colors duration-200`}
                          />
                        </Link>
                      </div>
                      <div>
                        {key === "hobbies" || key === "languages" ? (
                          <div className="flex flex-wrap gap-2">
                            {profile[key]?.map((item: string, index: number) => (
                              <button
                                key={index}
                                className="px-3 py-1 bg-gray-100 duration-200 transition-colors text-gray-700 rounded-full hover:bg-gray-200 text-sm"
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        ) : Array.isArray(profile[key]) ? (
                          <ul className="list-disc list-inside">
                            {profile[key]?.map((item: string, index: number) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p>{profile[key] || "Not specified"}</p>
                        )}
                      </div>
                      <Separator className="my-3" />
                    </React.Fragment>
                  ))
              )}
              <DashBoardSkills />
            </div>
          </CardContent>
        </Card>
      </div>
    </ProfileLayout>
  );
};

export default Dashboard;
