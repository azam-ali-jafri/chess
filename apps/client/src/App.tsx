import { Route, Routes } from "react-router-dom";
import { Landing } from "./screens/Landing";
import { Game } from "./screens/Game";
import Navbar from "./components/navbar";

const App = () => {
  return (
    <div className="bg-primary h-full">
      <Navbar />
      <div className="h-full bg-primary">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/game/:gameId" element={<Game />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
