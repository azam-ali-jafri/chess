import { TimeControl } from "@prisma/client";

export const timeControlMap: { [key in TimeControl]: number } = {
  [TimeControl.RAPID]: 10,
  [TimeControl.BLITZ]: 5,
  [TimeControl.BULLET]: 2,
};
