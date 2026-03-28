import React from "react";
import { Link } from "react-router-dom";
import { Rocket, BookOpen, MessageSquare, Zap } from "lucide-react";

const Home: React.FC = () => {
  return (
    <>
      <title>Welcome to my Page</title>
      <meta name="description" content="A shift to something with more potential." />

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
        <div className="mb-6">
          <Rocket size={64} className="text-blue-600 mx-auto mb-4" />
        </div>

        <h1 className="text-5xl font-bold text-blue-600">Welcome to NightRaid</h1>

        <p className="mt-4 text-lg text-gray-700 max-w-2xl">
          Still Working Here. Building something with more potential.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/about"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            <BookOpen size={20} />
            Learn More
          </Link>
          <Link
            to="/contact"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition"
          >
            <MessageSquare size={20} />
            Info
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <Zap size={32} className="text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">Fast & Modern</h3>
            <p className="text-sm text-gray-600 mt-1">Built with React and latest technologies</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <Rocket size={32} className="text-purple-500 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-800">In Development</h3>
            <p className="text-sm text-gray-600 mt-1">More features coming soon</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;