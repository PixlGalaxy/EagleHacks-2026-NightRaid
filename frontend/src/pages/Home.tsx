import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <>
      <title>Welcome to my Page</title>
      <meta name="description" content="A shift to something with more potential." />

      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
        <h1 className="text-5xl font-bold text-blue-600">Welcome to My Page</h1>
        <p className="mt-4 text-lg text-gray-700">
          Still Working Here.
        </p>
        <div className="mt-6 flex space-x-4">
          <Link
            to="/about"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            Learn More
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-600 transition"
          >
            Info
          </Link>
        </div>
      </div>
    </>
  );
};

export default Home;