"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import DashBoardSkills from "@/sections/DashBoardSkills";
import ProfileLayout from "@/components/layout";
import { useSession } from "next-auth/react";
import ProfileCompleteness from "../../../components/ProfileCompleteness";
import { DashBoardHeading } from "../../../sections/DashBoardHeading";
import PortfolioAnalytic from "../../../components/Analytics/PortfolioAnalytic";
import { Button } from "@/components/ui/button";

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

        const response = await fetch(
          `/api/portfolio/profile?userId=${session.user.id}`
        );
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

  const excludedFields: string[] = [
    "id",
    "userId",
    "createdAt",
    "updatedAt",
    "picture",
  ];

  const isValueEmpty = (value: any): boolean =>
    !value ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "string" && !value.trim());

  const SkeletalLoader = () => (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center space-x-2">
            <div className="h-5 w-1/3  animate-pulse rounded"></div>
            <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
          </div>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
          <Separator className="my-3" />
        </React.Fragment>
      ))}
      <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
    </div>
  );

  return (
    <ProfileLayout>
      <div className="min-h-screen  transition-colors duration-300 ">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="lg:flex justify-center items-center">
              <div className="w-full max-w-4xl rounded-2xl shadow-2xl      overflow-hidden">
                <div className="p-6 ">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Profile Dashboard</h2>
                  </div>
                  <div className="mt-4 flex items-center">
                    <div className="w-12 h-12 bg-white/30 rounded-full mr-4">
                      {profile?.picture ? (
                        <img
                          src={profile?.picture}
                          alt={session?.user?.name || "User Name"}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {session?.user?.name || "User Name"}
                      </div>
                      <div className="text-xs opacity-75">
                        {profile?.tagline || "No tagline"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-6">
                  <ProfileCompleteness profile={profile} />
                  <DashBoardHeading />
                  <div className="space-y-6">
                    {error ? (
                      <p className="text-red-500 dark:text-red-400">{error}</p>
                    ) : isLoading ? (
                      <SkeletalLoader />
                    ) : profile === null ? (
                      <div className="text-center text-gray-500">
                        <SkeletalLoader />
                      </div>
                    ) : (
                      Object.keys(profile)
                        .filter((key) => !excludedFields.includes(key))
                        .map((key) => (
                          <React.Fragment key={key}>
                            <div className="">
                              <p className="font-semibold capitalize flex-grow">
                                {key.replace(/([A-Z])/g, " $1")}
                              </p>
                              <Link href="/profile/details">
                                <ExternalLink
                                  className={`w-5 h-5 ${
                                    isValueEmpty(profile[key])
                                      ? "text-red-500 dark:text-red-400"
                                      : "text-green-500 dark:text-green-400"
                                  } transition-colors duration-200`}
                                />
                              </Link>
                            </div>
                            <div>
                              {key === "hobbies" || key === "languages" ? (
                                <div className="flex flex-wrap gap-2">
                                  {profile[key]?.map(
                                    (item: string, index: number) => (
                                      <Button
                                        key={index}
                                        className="px-3 py-1 bg-gray-100  dark:bg-gray-700 rounded"
                                      >
                                        {item}
                                      </Button>
                                    )
                                  )}
                                </div>
                              ) : Array.isArray(profile[key]) ? (
                                <ul className="list-disc list-inside">
                                  {profile[key]?.map(
                                    (item: string, index: number) => (
                                      <li key={index}>{item}</li>
                                    )
                                  )}
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
                </div>
              </div>
            </div>
            <PortfolioAnalytic />
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Dashboard;

