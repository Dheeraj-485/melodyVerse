import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { BASE_URL } from "../baseUrl";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const res = await axios.get(`${BASE_URL}/auth/own`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res);
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <div className="max-w-6xl mx-auto mt-10 p-6 flex  justify-center h-[50vh] items-center">
          <div className="bg-white p-6 rounded-lg shadow-md w-[20rem] items-center">
            <h3 className="text-xl font-semibold mb-4">Account Information</h3>
            <p>
              <strong>fullName:</strong> {user?.fullName}
            </p>
            <p>
              <strong>Username:</strong> {user?.username}
            </p>
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* New  */}

      {/* New end  */}
    </>
  );
};

export default Dashboard;
