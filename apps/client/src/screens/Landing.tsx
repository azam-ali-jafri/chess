import { Button } from "@/components/ui/button";
import { INIT_GAME } from "@/constants/messages";
import { useAuth } from "@/context/authContext";
import { useSocket } from "@/context/socketContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Landing = () => {
  const [isFinding, setIsFinding] = useState(false);
  const socket = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePlay = () => {
    console.log(socket);

    setIsFinding(true);
    socket?.send(JSON.stringify({ type: INIT_GAME, playerId: user?.id }));
  };

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(message);

        if (message.type == INIT_GAME) {
          localStorage.setItem("color", message.color);
          navigate(`/game/${message?.gameId}`);
        }
      };
    }
  }, [navigate, socket]);

  return (
    <div className="grid grid-cols-3 w-full lg:w-4/5 mx-auto gap-y-10 lg:gap-y-0 items-center pb-10 px-5">
      <div className="relative w-full col-span-3 lg:col-span-2 flex justify-center">
        <img
          src={"/board.png"}
          className="w-full lg:w-[500px] pointer-events-none"
        />
      </div>
      <div className="flex flex-col gap-6 col-span-3 lg:col-span-1">
        <h1 className="font-bold text-2xl md:text-4xl lg:text-4xl xl:text-5xl text-white text-center">
          Play Chess Online
        </h1>
        <Button
          variant={"secondary"}
          onClick={handlePlay}
          size={"lg"}
          className="text-xl font-semibold py-7"
          loadingText="Searching"
          isLoading={isFinding}
          disabled={isFinding}
        >
          Play Online
        </Button>
      </div>
    </div>
  );
};
