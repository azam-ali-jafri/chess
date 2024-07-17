import { Link } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { Button } from "./button";

const Navbar = () => {
  const { isLoggedIn, isUserLoading, login } = useAuth();

  return (
    <nav className="bg-[#262522] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white font-bold text-xl">
          Chess
        </Link>

        <div>
          {!isLoggedIn ? (
            <Link to="/profile" className="text-white mr-4">
              Profile
            </Link>
          ) : (
            <Button label="Login" onClick={login} />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
