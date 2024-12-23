"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import SkillsSection from "@/components/ProfileSkillsData";
import ProfileLayout from "@/components/layout";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProfileData {
  userId?: string;
  tagline: string;
  bio: string;
  hobbies: string;
  languages: string;
  picture: string | null;
  previewUrl?: string;
  phoneNumber?: string;
  address?: string;
}

export default function ProfileDetails() {
  const { data: session, status } = useSession();

  const [formData, setFormData] = useState<ProfileData>({
    userId: "",
    tagline: "",
    bio: "",
    hobbies: "",
    languages: "",
    picture: null,
    previewUrl: "",
    phoneNumber: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      toast({
        title: "Unauthorized",
        description: "You need to be logged in to view or edit your profile.",
        variant: "destructive",
      });
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `/api/portfolio/profile?userId=${session.user.id}`
        );
        const data = await response.json();
        console.log(data);

        if (response.ok) {
          setFormData({
            userId: data.userId || "",
            tagline: data.tagline || "",
            bio: data.bio || "",
            address: data.address || "",
            phoneNumber: data.phoneNumber || "",
            hobbies: Array.isArray(data.hobbies)
              ? data.hobbies.join(", ")
              : data.hobbies || "",
            languages: Array.isArray(data.languages)
              ? data.languages.join(", ")
              : data.languages || "",
            picture: null,
            previewUrl: data.picture || "",
          });
        } else {
          toast({
            title: "Error fetching profile",
            description: data.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: "Failed to fetch profile data.",
          variant: "destructive",
        });
      }
    };

    fetchProfile();
  }, [session, status]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, files } = target;

    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          picture: reader.result as string,
          previewUrl: URL.createObjectURL(file),
        }));
      };

      reader.readAsDataURL(file);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value ?? "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        tagline: formData.tagline,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        bio: formData.bio,
        hobbies: formData.hobbies
          ? formData.hobbies.split(",").map((hobby) => hobby.trim())
          : [],
        languages: formData.languages
          ? formData.languages.split(",").map((lang) => lang.trim())
          : [],
      };

      if (formData.picture) {
        payload.picture = formData.picture;
      }

      const response = await fetch("/api/portfolio/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile");
      }

      toast({
        description: "Profile updated successfully",
        variant: "default",
      });

      setFormData((prev) => ({
        ...prev,
        previewUrl: result.picture || prev.previewUrl,
        picture: result.picture || prev.picture,
      }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <ProfileLayout>
      <div className="container mx-auto px-4">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {formData.previewUrl && (
                  <div className="flex justify-center mb-4">
                    <img
                      src={formData.previewUrl}
                      alt="Profile Preview"
                      className="rounded-full w-24 h-24 object-cover"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    name="tagline"
                    value={formData.tagline}
                    onChange={handleChange}
                    placeholder="Enter your tagline"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div>
                  <Label htmlFor="hobbies">Hobbies</Label>
                  <Input
                    id="hobbies"
                    name="hobbies"
                    value={formData.hobbies}
                    onChange={handleChange}
                    placeholder="Enter your hobbies (comma-separated)"
                  />
                </div>

                <div>
                  <Label htmlFor="languages">Languages</Label>
                  <Input
                    id="languages"
                    name="languages"
                    value={formData.languages}
                    onChange={handleChange}
                    placeholder="Enter the languages you speak (comma-separated)"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address or location"
                  />
                </div>

                <div>
                  <Label htmlFor="picture">Profile Image</Label>
                  <Input
                    id="picture"
                    name="picture"
                    type="file"
                    onChange={handleChange}
                    accept="image/*"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
        <section>
          <SkillsSection />
        </section>
      </div>
    </ProfileLayout>
  );
}
