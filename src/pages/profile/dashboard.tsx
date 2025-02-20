"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ExternalLink,
  User,
  Briefcase,
  Globe,
  Heart,
  TrendingUp,
  Award,
  Edit,
  Camera,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import DashBoardSkills from "@/sections/DashBoardSkills";
import ProfileLayout from "@/components/layout";
import { useSession } from "next-auth/react";
import ProfileCompleteness from "@/components/ProfileCompleteness";
import PortfolioAnalytic from "@/components/Analytics/PortfolioAnalytic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashBoardHeading } from "@/sections/DashBoardHeading";
import UserBackupButton from "../../../components/UserDownloadButton";

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
  tagline?: string;
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
    "name",
    "email",
    "tagline",
  ];

  const SkeletalLoader = () => (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"
        ></div>
      ))}
    </div>
  );

  return (
    <ProfileLayout>
      <div className=" py-2 ">
        <Card className="mb-8 overflow-hidden border-0 shadow-xl rounded-xl">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-primary">
                Profile Overview
              </h2>
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 px-2 text-xs hover:bg-primary/10"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  <a
                    href="/profile/details"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Edit
                  </a>
                </Button>
                <UserBackupButton />
              </div>
            </div>
          </div>

          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row gap-6 p-6">
              <div className="flex flex-col items-center md:items-start">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                    <AvatarImage
                      src={profile?.picture}
                      alt={session?.user?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/5">
                      <User className="h-12 w-12 text-primary/50" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-sm">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 rounded-full"
                    >
                      <Camera className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                </div>

                <div className="mt-4 text-center md:text-left">
                  <h1 className="text-xl font-bold text-foreground">
                    {session?.user?.name || "User Name"}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile?.tagline || "No tagline available"}
                  </p>
                </div>
              </div>

              <div className="grow">
                <div className="bg-muted/30  rounded-lg">
        
                  <ProfileCompleteness profile={profile} />
                </div>
              </div>
            </div>

            <Separator />
            <div className="p-6">
              <DashBoardHeading />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <span>Profile Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <p className="text-red-500 dark:text-red-400">{error}</p>
              ) : isLoading ? (
                <SkeletalLoader />
              ) : profile === null ? (
                <div className="text-center text-muted-foreground">
                  <p>No profile data available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.keys(profile)
                    .filter((key) => !excludedFields.includes(key))
                    .map((key) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-medium capitalize flex items-center space-x-2">
                            {key === "hobbies" && (
                              <Heart className="h-4 w-4 text-primary" />
                            )}
                            {key === "languages" && (
                              <Globe className="h-4 w-4 text-primary" />
                            )}
                            {key === "skills" && (
                              <Briefcase className="h-4 w-4 text-primary" />
                            )}
                            <span>{key.replace(/([A-Z])/g, " $1")}</span>
                          </h3>
                          <Link href="/profile/details">
                            <Button variant="default" size="sm">
                              <ExternalLink className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                        </div>
                        <div>
                          {key === "hobbies" ||
                          key === "languages" ||
                          key === "skills" ? (
                            <div className="flex flex-wrap gap-2">
                              {profile[key]?.map(
                                (item: string, index: number) => (
                                  <Button
                                    key={index}
                                    variant="default"
                                    size="sm"
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
                            <p className="text-sm text-muted-foreground">
                              {profile[key] || "Not specified"}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <div className="mt-6">
                <DashBoardSkills />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card className="overflow-hidden border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Portfolio Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PortfolioAnalytic userName={session?.user.username} />
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Achievements</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span>Top Contributor</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span>Skill Master</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-green-500" />
                    <span>Project Completer</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Dashboard;
