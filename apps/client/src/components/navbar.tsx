import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { primaryButtonStyles } from "./button";
import { Loader, User } from "lucide-react";

const Navbar = () => {
  const { isAuthenticated, isUserLoading, login, user, logout } = useAuth();
  console.log(user?.displayPicture);

  return (
    <nav className="bg-[#262522] py-4 px-4 md:px-8 lg:px-14 mb-10 h-[4rem]">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white font-bold text-xl">
          Chess
        </Link>

        <div className="flex items-center justify-center">
          {isUserLoading ? (
            <Loader className="animate-spin text-white" />
          ) : (
            <>
              {isAuthenticated ? (
                <div className="flex gap-x-8 items-center">
                  <div
                    className={`relative size-9 rounded-full bg-[#739552] flex items-center justify-center cursor-pointer ${!user?.displayPicture && "p-1"}`}
                  >
                    {user?.displayPicture ? (
                      <img
                        src={user?.displayPicture}
                        alt="user-pic"
                        className="size-full rounded-full"
                      />
                    ) : (
                      <User className="text-white" />
                    )}
                  </div>
                  <button
                    className={`${primaryButtonStyles} text-sm py-2 px-4 border-b-2`}
                    onClick={logout}
                    disabled={isUserLoading}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  className={`${primaryButtonStyles} text-sm py-2 px-4 border-b-2`}
                  onClick={login}
                  disabled={isUserLoading}
                >
                  Login
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
