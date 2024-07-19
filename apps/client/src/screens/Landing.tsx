import { useNavigate } from "react-router-dom";
import { Button } from "../components/button";

export const Landing = () => {
  const navigate = useNavigate();

  const handlePlay = () => {};

  return (
    <div className="grid grid-cols-3 w-full lg:w-4/5 mx-auto gap-y-10 lg:gap-y-0 items-center pb-10">
      <div className="relative w-full col-span-3 lg:col-span-2 flex justify-center">
        <img
          src={"/board.png"}
          className="w-full lg:w-[500px] pointer-events-none"
        />
      </div>
      <div className="flex flex-col gap-6 col-span-3 lg:col-span-1">
        <h1 className="font-bold text-2xl md:text-4xl lg:text-4xl xl:text-5xl text-white leading-7 lg:leading-[3rem] text-center">
          Play Chess Online
        </h1>
        <Button label="Play Online" onClick={handlePlay} />
      </div>
    </div>
  );
};
