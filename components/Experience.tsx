"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import { IPhoneFrame } from "./Preview";

interface Experience {
  id: string;
  userId: string;
  company: string;
  position: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  isCurrentRole: boolean;
}

export default function Experience() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [newExperience, setNewExperience] = useState<Partial<Experience>>({
    isCurrentRole: false,
  });
  const [editExperience, setEditExperience] =
    useState<Partial<Experience> | null>(null);

  const fetchExperiences = async () => {
    if (!userId) return;
    try {
      const response = await fetch(
        `/api/portfolio/experience?userId=${userId}`
      );
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error("Failed to fetch experiences:", error);
    }
  };

  const addExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newExperience.company &&
      newExperience.position &&
      newExperience.startDate &&
      userId
    ) {
      const newExp = {
        ...newExperience,
        userId,
      };

      try {
        const response = await fetch("/api/portfolio/experience", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newExp),
        });

        if (response.ok) {
          const addedExperience = await response.json();
          setExperiences([...experiences, addedExperience]);
          setNewExperience({ isCurrentRole: false });
        } else {
          console.error("Failed to add experience");
        }
      } catch (error) {
        console.error("Error saving experience:", error);
      }
    }
  };

  const deleteExperience = async (id: string) => {
    try {
      const response = await fetch(
        `/api/portfolio/experience?experienceId=${id}&userId=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setExperiences(experiences.filter((exp) => exp.id !== id));
      } else {
        console.error("Failed to delete experience");
      }
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  const updateExperience = async (
    id: string,
    updatedData: Partial<Experience>
  ) => {
    try {
      const response = await fetch(`/api/portfolio/experience`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experienceId: id,
          ...updatedData,
          userId,
        }),
      });

      if (response.ok) {
        const updatedExperience = await response.json();
        setExperiences(
          experiences.map((exp) => (exp.id === id ? updatedExperience : exp))
        );
        setEditExperience(null);
      } else {
        console.error("Failed to update experience");
      }
    } catch (error) {
      console.error("Update error", error);
    }
  };

  const handleEditClick = (exp: Experience) => {
    setEditExperience(exp);
  };

  const handleEditCancel = () => {
    setEditExperience(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editExperience && editExperience.id) {
      await updateExperience(editExperience.id, editExperience);
    }
  };

  useEffect(() => {
    if (userId) fetchExperiences();
  }, [userId]);

  return (
    <section>
      <div className="bg-gray-50 container mx-auto min-h-screen">
        <div className=" py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Briefcase className="mr-2" /> Work Experience
              </h2>

              {editExperience ? (
                <form onSubmit={handleEditSubmit} className="space-y-3">
                  <div className="grid lg:grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="edit-company">Company Name</Label>
                      <Input
                        id="edit-company"
                        value={editExperience.company || ""}
                        onChange={(e) =>
                          setEditExperience((prev) => ({
                            ...prev,
                            company: e.target.value,
                          }))
                        }
                        placeholder="Company Name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-position">Job Title</Label>
                      <Input
                        id="edit-position"
                        value={editExperience.position || ""}
                        onChange={(e) =>
                          setEditExperience((prev) => ({
                            ...prev,
                            position: e.target.value,
                          }))
                        }
                        placeholder="Job Title"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-3 grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="edit-start-date">Start Date</Label>
                      <Input
                        id="edit-start-date"
                        type="date"
                        value={
                          editExperience.startDate
                            ? format(
                                new Date(editExperience.startDate),
                                "yyyy-MM-dd"
                              )
                            : ""
                        }
                        onChange={(e) =>
                          setEditExperience((prev) => ({
                            ...prev,
                            startDate: new Date(e.target.value),
                          }))
                        }
                        required
                      />
                    </div>
                    {!editExperience.isCurrentRole && (
                      <div>
                        <Label htmlFor="edit-end-date">End Date</Label>
                        <Input
                          id="edit-end-date"
                          type="date"
                          value={
                            editExperience.endDate
                              ? format(
                                  new Date(editExperience.endDate),
                                  "yyyy-MM-dd"
                                )
                              : ""
                          }
                          onChange={(e) =>
                            setEditExperience((prev) => ({
                              ...prev,
                              endDate: new Date(e.target.value),
                            }))
                          }
                        />
                      </div>
                    )}
                    <div className="flex items-center">
                      <input
                        id="edit-current-role"
                        type="checkbox"
                        checked={editExperience.isCurrentRole || false}
                        onChange={(e) =>
                          setEditExperience((prev) => ({
                            ...prev,
                            isCurrentRole: e.target.checked,
                            endDate: e.target.checked ? null : prev?.endDate,
                          }))
                        }
                        className="mr-2"
                      />
                      <Label htmlFor="edit-current-role">Current Role</Label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Job Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editExperience.description || ""}
                      onChange={(e) =>
                        setEditExperience((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Job Description"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button type="submit" variant="outline" className="w-full">
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleEditCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={addExperience} className="space-y-3">
                  <div className="grid lg:grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="add-company">Company Name</Label>
                      <Input
                        id="add-company"
                        value={newExperience.company || ""}
                        onChange={(e) =>
                          setNewExperience((prev) => ({
                            ...prev,
                            company: e.target.value,
                          }))
                        }
                        placeholder="Company Name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="add-position">Job Title</Label>
                      <Input
                        id="add-position"
                        value={newExperience.position || ""}
                        onChange={(e) =>
                          setNewExperience((prev) => ({
                            ...prev,
                            position: e.target.value,
                          }))
                        }
                        placeholder="Job Title"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-3 grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="add-start-date">Start Date</Label>
                      <Input
                        id="add-start-date"
                        type="date"
                        value={
                          newExperience.startDate
                            ? format(
                                new Date(newExperience.startDate),
                                "yyyy-MM-dd"
                              )
                            : ""
                        }
                        onChange={(e) =>
                          setNewExperience((prev) => ({
                            ...prev,
                            startDate: new Date(e.target.value),
                          }))
                        }
                        required
                      />
                    </div>
                    {!newExperience.isCurrentRole && (
                      <div>
                        <Label htmlFor="add-end-date">End Date</Label>
                        <Input
                          id="add-end-date"
                          type="date"
                          value={
                            newExperience.endDate
                              ? format(
                                  new Date(newExperience.endDate),
                                  "yyyy-MM-dd"
                                )
                              : ""
                          }
                          onChange={(e) =>
                            setNewExperience((prev) => ({
                              ...prev,
                              endDate: new Date(e.target.value),
                            }))
                          }
                        />
                      </div>
                    )}
                    <div className="flex mt-2 lg:mt-0 items-center">
                      <input
                        id="add-current-role"
                        type="checkbox"
                        checked={newExperience.isCurrentRole}
                        onChange={(e) =>
                          setNewExperience((prev) => ({
                            ...prev,
                            isCurrentRole: e.target.checked,
                            endDate: e.target.checked ? null : prev.endDate,
                          }))
                        }
                        className="mr-2"
                      />
                      <Label htmlFor="add-current-role">Current Role</Label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="add-description">Job Description</Label>
                    <Textarea
                      id="add-description"
                      value={newExperience.description || ""}
                      onChange={(e) =>
                        setNewExperience((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Job Description"
                    />
                  </div>
                  <Button type="submit" variant="outline" className="w-full">
                    <Plus className="mr-2" /> Add Experience
                  </Button>
                </form>
              )}
            </div>
            <div className="relative">
              <div className="">
                <IPhoneFrame>
                  <div className="space-y-3 ">
                    {experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="bg-white rounded-lg border border-gray-100 overflow-hidden"
                      >
                        <div className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium line-clamp-1">
                                {exp.company}
                              </h3>
                              <p className="text-xs text-gray-600 line-clamp-1">
                                {exp.position}
                              </p>
                            </div>
                            <div className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                              {format(new Date(exp.startDate), "MM/yy")} -{" "}
                              {exp.endDate
                                ? format(new Date(exp.endDate), "MM/yy")
                                : "Present"}
                            </div>
                          </div>

                          <p className="text-xs text-gray-700 line-clamp-2 mb-2">
                            {exp.description}
                          </p>

                          <div className="flex gap-1.5">
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 text-xs px-2 flex-1"
                              onClick={() => deleteExperience(exp.id)}
                            >
                              <X className="w-3 h-3 mr-1" /> Delete
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs px-2 flex-1"
                              onClick={() => handleEditClick(exp)}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </IPhoneFrame>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
