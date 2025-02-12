"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ProfileLayout from "@/components/layout";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { IPhoneFrame } from "@/components/Preview";
import ProfilePreview from "../../../components/ProfilePreview";
import UploadSkillForm from "@/components/AddSkill";

interface ProfileData {
  userId?: string;
  tagline: string;
  bio: string;
  hobbies: string;
  languages: string;
  picture: File | null;
  previewUrl?: string;
  phoneNumber?: string;
  address?: string;
  levelOfExperience?: "Junior" | "Mid" | "Senior";
  yearsOfExperience?: number;
}

interface Skill {
  id: string;
  name: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
}

export default function ProfileDetails() {
  const { data: session, status } = useSession();
  const [info, setInfo] = useState([]);
  const [name, setName] = useState<string>("");
  const [level, setLevel] = useState<
    "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT"
  >("BEGINNER");
  const [skills, setSkills] = useState<Skill[]>([]);

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
    levelOfExperience: "Junior", // Default value
    yearsOfExperience: 0, // Default value
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
            levelOfExperience: data.levelOfExperience || "Junior", // Set level of experience
            yearsOfExperience: data.yearsOfExperience || 0, // Set years of experience
          });
          setInfo(data);
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, files } = target;

    if (files && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        picture: file,
        previewUrl: URL.createObjectURL(file),
      }));
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
      const submitFormData = new FormData();

      submitFormData.append("tagline", formData.tagline);
      submitFormData.append("bio", formData.bio);
      submitFormData.append("address", formData.address || "");
      submitFormData.append("phoneNumber", formData.phoneNumber || "");
      submitFormData.append(
        "levelOfExperience",
        formData.levelOfExperience || "Junior"
      );
      submitFormData.append(
        "yearsOfExperience",
        formData.yearsOfExperience?.toString() || "0"
      );

      submitFormData.append(
        "hobbies",
        JSON.stringify(
          formData.hobbies
            ? formData.hobbies.split(",").map((hobby) => hobby.trim())
            : []
        )
      );
      submitFormData.append(
        "languages",
        JSON.stringify(
          formData.languages
            ? formData.languages.split(",").map((lang) => lang.trim())
            : []
        )
      );

      if (formData.picture) {
        submitFormData.append("file", formData.picture);
      }

      const response = await fetch("/api/portfolio/profile", {
        method: "PATCH",
        body: submitFormData,
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

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch("/api/portfolio/skill");
        if (response.ok) {
          const data: Skill[] = await response.json();
          setSkills(data);
        } else {
          console.error("Failed to fetch skills");
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    fetchSkills();
  }, []);

  const handleSubmitSkills = async (e: React.FormEvent) => {
    e.preventDefault();

    const skillData = { name, level };

    try {
      const response = await fetch("/api/portfolio/skill", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(skillData),
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to add the skill. Please try again.",
        });
        return;
      }

      const newSkill: Skill = await response.json();

      toast({
        variant: "default",
        title: "Skill Added",
        description: `The skill "${name}" with level "${level}" has been successfully added.`,
      });

      setSkills((prevSkills) => [...prevSkills, newSkill]); // Update local state
      setName("");
      setLevel("BEGINNER");
    } catch (error) {
      console.error("Error uploading skill:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add the skill. Please try again.",
      });
    }
  };

  return (
    <ProfileLayout>
      <div className=" py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section>
              <Card className="border-0">
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                </CardHeader>
              </Card>

              <Card className="mt-4  border-0">
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
                        className="resize-y h-[150px]"
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
                      <Label htmlFor="levelOfExperience">
                        Level of Experience
                      </Label>
                      <select
                        id="levelOfExperience"
                        name="levelOfExperience"
                        value={formData.levelOfExperience}
                        onChange={handleChange}
                        className="w-full bg-transparent outline-none text-heading p-2 border rounded"
                      >
                        <option value="Junior">Junior</option>
                        <option value="Mid">Mid</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="yearsOfExperience">
                        Years of Experience
                      </Label>
                      <Input
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        type="number"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        placeholder="Enter your years of experience"
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
                      disabled={isSubmitting}
                      className="w-full dark:text-black"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <UploadSkillForm
                name={name}
                level={level}
                setLevel={setLevel}
                setName={setName}
                skills={skills}
                handleSubmitSkills={handleSubmitSkills}
              />
            </section>
          </div>

          <div>
            <div className="relative">
              <div className="">
                <IPhoneFrame>
                  <ProfilePreview
                    skills={skills}
                    data={formData}
                    loading={status === "loading"}
                  />
                </IPhoneFrame>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
}
