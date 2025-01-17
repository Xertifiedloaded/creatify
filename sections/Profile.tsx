import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

interface Profile {
  name: string;
  tagline: string;
  picture: string;
  username: string;
  skills: Skill[];
}

interface Skill {
  name: string;
  level: string;
}

const ProfileCard: React.FC<Profile> = ({
  name,
  tagline,
  picture,
  username,
  skills,
}) => {
  return (
    <Link
      href={`/portfolio/${username}`}
      className="group relative bg-white dark:bg-black border border-neutral-200 dark:border-gray-800 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-700 hover:-translate-y-2"
    >
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <Image
              width={100}
              height={100}
              src={picture}
              alt={name}
              className="w-16 h-16 rounded-full border-3 border-neutral-200 dark:border-gray-600 group-hover:scale-110 transition-transform"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{name}</h3>
            <p className="text-sm text-neutral-600 dark:text-gray-300">{tagline}</p>
          </div>
        </div>

        <div className="mt-4">
          <ul className="mt-2 text-sm text-neutral-600 dark:text-gray-300">
            {skills.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-800 dark:text-gray-200"
                  >
                    <span>{skill.name}</span>
                  </span>
                ))}
              </ul>
            ) : (
              <li className="text-xs">No skills available</li>
            )}
          </ul>
        </div>
      </div>
    </Link>
  );
};

const ProfileSection: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get("/api/portfolio/users");
        setProfiles(response.data);
      } catch (err) {
        setError("Failed to load profiles");
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <div className="text-red-500 dark:text-red-400">{error}</div>;
  }

  return (
    <section className="bg-neutral-50 dark:bg-black py-16 transition-colors duration-200">
      <div className="px-6">
        <div className="text-center mb-12">
          <div className="inline-block bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            Registered Users
          </div>
          <h2 className="lg:text-4xl text-xl font-bold text-neutral-900 dark:text-white mb-4">
            Meet a few of our Registered Users
          </h2>
          <p className="lg:text-xl text-sm text-neutral-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover the diverse individuals who have joined our platform to
            collaborate and grow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {profiles.map((profile, index) => (
            <ProfileCard key={index} {...profile} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;

const SkeletonLoader: React.FC = () => (
  <div className="grid wrapper my-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array(6)
      .fill(null)
      .map((_, index) => (
        <div key={index} className="animate-pulse flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2" />
          </div>
        </div>
      ))}
  </div>
);

