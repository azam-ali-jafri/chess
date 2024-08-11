import { Button } from "@/components/ui/button";
import { CANCEL_INIT, INIT_GAME } from "@/constants/messages";
import { useAuth } from "@/context/authContext";
import { useSocket } from "@/context/socketContext";
import { useModal } from "@/store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Clock, Rabbit, Zap } from "lucide-react";

const modes = [
  { label: "Bullet", time: 1, icon: Rabbit },
  { label: "Blitz", time: 5, icon: Zap },
  { label: "Rapid", time: 10, icon: Clock },
];

export const Landing = () => {
  const [isFinding, setIsFinding] = useState(false);
  const socket = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal } = useModal();
  const [timeMode, setTimeMode] = useState(10);

  const handlePlay = () => {
    if (!user) return openModal("login");

    setIsFinding(true);
    socket?.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { playerId: user?.id, time: timeMode },
      })
    );
  };

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log(message);

        if (message.type == INIT_GAME) {
          localStorage.setItem("color", message?.payload?.color);
          navigate(`/game/${message?.payload?.gameId}`);
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
        <div className="flex flex-col gap-y-4">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant={"secondary"}
                className="text-xl font-semibold py-7 w-full flex gap-x-4"
              >
                {modes.find((mode) => mode.time == timeMode)?.label}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96">
              {modes.map((mode) => (
                <DropdownMenuItem
                  className="w-full"
                  key={mode.label}
                  onClick={() => setTimeMode(mode.time)}
                >
                  <Button
                    className="w-full font-seimbold text-lg py-7 flex gap-x-4"
                    variant={"outline"}
                  >
                    {mode.label}
                    <mode.icon />
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            className={`text-xl font-semibold py-7 ${isFinding ? "opacity-100" : "opacity-0"} transition`}
            variant={"destructive"}
            onClick={() => {
              socket?.send(
                JSON.stringify({
                  type: CANCEL_INIT,
                  payload: { playerId: user?.id },
                })
              );
              setIsFinding(false);
            }}
          >
            Cancel Search
          </Button>
        </div>
      </div>
    </div>
  );
};
