import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../baseUrl";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link");
      return;
    }
    const verify = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/auth/verify-email/${token}`
        );
        if (response.status === 200) {
          setMessage(response.data.message);
        }

        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        setMessage(error.message);
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{message}</h2>
      </div>
    </div>
  );
};

export default VerifyEmail;
