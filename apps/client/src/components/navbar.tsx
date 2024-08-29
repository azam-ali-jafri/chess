import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Loader, User } from "lucide-react";
import { Button } from "./ui/button";

const Navbar = () => {
  const { isAuthenticated, isUserLoading, login, user, logout } = useAuth();

  return (
    <nav className="bg-primary py-4 px-4 md:px-8 lg:px-14 mb-10 lg:mb-0 h-[4.5rem] border-b-2 border-[#739552]">
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
                  <Button
                    variant={"secondary"}
                    disabled={isUserLoading}
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  variant={"secondary"}
                  disabled={isUserLoading}
                  onClick={login}
                >
                  Login
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
