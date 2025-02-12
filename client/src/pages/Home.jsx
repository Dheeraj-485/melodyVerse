import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Homepage = () => {
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to MelodyVerse</h1>
        <p className="text-lg mb-6">
          Stream your favorite music anytime, anywhere.
        </p>
        <Link
          to="/signup"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg"
        >
          Get Started
        </Link>
      </div>
    </>
  );
};

export default Homepage;
