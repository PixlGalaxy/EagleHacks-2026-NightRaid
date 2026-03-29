import React, { useEffect, useState } from "react";
import {
  Landmark,
  GitBranch,
  Users,
  ExternalLink,
  Loader2,
  AlertCircle,
  MapPin,
  Building2,
  BookOpen,
} from "lucide-react";

type GitHubUser = {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
};

// GitHub usernames of contributors extracted from git history
const CONTRIBUTORS = ["PixlGalaxy", "yudintsevtimofey", "EvanG64"];

const About: React.FC = () => {
  const [users, setUsers] = useState<(GitHubUser | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const results = await Promise.all(
          CONTRIBUTORS.map((username) =>
            fetch(`https://api.github.com/users/${username}`, {
              headers: { Accept: "application/vnd.github+json" },
            })
              .then((r) => (r.ok ? (r.json() as Promise<GitHubUser>) : null))
              .catch(() => null)
          )
        );
        setUsers(results);
      } catch {
        setError("Failed to load developer profiles from GitHub.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-orange-50 text-slate-800">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500 mb-4 shadow-md">
            <Landmark size={28} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold">
            <span className="text-slate-900">Night</span>
            <span className="text-orange-500">Raid</span>
          </h1>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto text-base">
            An AI-powered banking statement analysis tool built for{" "}
            <span className="font-semibold text-orange-600">EagleHacks 2026</span>.
            Leveraging large language models to surface spending insights, anomalies, risk signals, and actionable recommendations.
          </p>
        </header>

        {/* Project info */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-orange-500" />
            About the Project
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-700">
            <div className="p-4 rounded-lg bg-orange-50 border border-orange-100">
              <p className="font-semibold text-orange-700 mb-1">Event</p>
              <p>EagleHacks 2026</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="font-semibold text-blue-700 mb-1">Stack</p>
              <p>React · Flask · Ollama · Tailwind</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
              <p className="font-semibold text-slate-700 mb-1">Repository</p>
              <a
                href="https://github.com/yudintsevtimofey/EagleHacks-2026-NightRaid"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:underline"
              >
                <GitBranch size={13} />
                EagleHacks-2026-NightRaid
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </section>

        {/* Developers */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-orange-500" />
            Developers
          </h2>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading developer profiles…</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-5 sm:grid-cols-2">
              {users.map((user, idx) => {
                const username = CONTRIBUTORS[idx];
                if (!user) {
                  return (
                    <div
                      key={username}
                      className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex items-center gap-3 text-sm text-slate-500"
                    >
                      <AlertCircle size={16} className="text-slate-400" />
                      Could not load profile for{" "}
                      <a
                        href={`https://github.com/${username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium"
                      >
                        @{username}
                      </a>
                    </div>
                  );
                }
                return (
                  <div
                    key={user.login}
                    className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 flex flex-col gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar_url}
                        alt={user.login}
                        className="w-16 h-16 rounded-full border-2 border-orange-200 shadow-sm object-cover"
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-base leading-tight">
                          {user.name || user.login}
                        </h3>
                        <a
                          href={user.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition"
                        >
                          <GitBranch size={13} />
                          @{user.login}
                          <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>

                    {user.bio && (
                      <p className="text-sm text-slate-600 leading-relaxed">{user.bio}</p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                      {user.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {user.location}
                        </span>
                      )}
                      {user.company && (
                        <span className="flex items-center gap-1">
                          <Building2 size={12} className="text-slate-400" />
                          {user.company}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-4 border-t border-slate-100 pt-3 text-sm">
                      <div className="text-center">
                        <p className="font-bold text-slate-800">{user.public_repos}</p>
                        <p className="text-xs text-slate-500">Repos</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-800">{user.followers}</p>
                        <p className="text-xs text-slate-500">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-800">{user.following}</p>
                        <p className="text-xs text-slate-500">Following</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default About;
