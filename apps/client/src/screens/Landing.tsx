import { Button } from "@/components/ui/button";
import { CANCEL_INIT, INIT_GAME } from "@/constants/messages";
import { useAuth } from "@/context/authContext";
import { useSocket } from "@/context/socketContext";
import { useModal } from "@/store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CoffeeIcon, Rabbit, Zap } from "lucide-react";
import { TimeControl } from "@prisma/client";

const modes = [
  { label: "Bullet", value: "BULLET", icon: Rabbit },
  { label: "Blitz", value: "BLITZ", icon: Zap },
  { label: "Rapid", value: "RAPID", icon: Clock },
  { label: "Classic", value: "CLASSIC", icon: CoffeeIcon },
];

export const Landing = () => {
  const [isFinding, setIsFinding] = useState(false);
  const socket = useSocket();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openModal } = useModal();
  const [timeMode, setTimeMode] = useState<TimeControl>("RAPID");

  const handlePlay = () => {
    if (!user) return openModal("login");

    setIsFinding(true);
    socket?.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: { playerId: user?.id, timemode: timeMode },
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

        if (message.type == CANCEL_INIT) {
          setIsFinding(false);
        }
      };
    }
  }, [navigate, socket]);

  return (
    <div className="grid grid-cols-4 w-full lg:w-11/12 xl:w-4/5 mx-auto gap-y-10 lg:gap-y-0 items-center pb-10 px-5 h-full">
      <div className="relative w-full col-span-4 lg:col-span-2 flex justify-center">
        <img
          src={"/board.png"}
          className="w-full lg:w-[400px] xl:w-[500px] pointer-events-none"
        />
      </div>
      <div className="flex flex-col gap-6 col-span-4 lg:col-span-2">
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
          <div className="grid grid-cols-2 gap-x-4 lg:gap-x-2 xl:gap-x-4 flex-wrap gap-y-4">
            {modes.map((mode) => (
              <Button
                key={mode.value}
                className={`text-xl font-semibold py-7 flex-1 flex gap-x-4 justify-between ${
                  timeMode === mode.value
                    ? "bg-primary text-white border-white border hover:bg-primary/80"
                    : "bg-white text-black hover:bg-white/80"
                }`}
                onClick={() => setTimeMode(mode.value as TimeControl)}
              >
                {mode.label}
                <mode.icon />
              </Button>
            ))}
          </div>

          <Button
            className={`text-xl font-semibold py-7 ${
              isFinding ? "opacity-100" : "opacity-0"
            } transition`}
            variant={"destructive"}
            onClick={() => {
              socket?.send(
                JSON.stringify({
                  type: CANCEL_INIT,
                  payload: { playerId: user?.id, timemode: timeMode },
                })
              );
            }}
          >
            Cancel Search
          </Button>
        </div>
      </div>
    </div>
  );
};
