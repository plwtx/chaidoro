import useCurrentDate from "../hooks/useCurrentDate";

interface DailyFocusProps {
  hours: string;
  minutes: string;
}

export default function DailyFocus({ hours, minutes }: DailyFocusProps) {
  const currentDate = useCurrentDate();
  return (
    <>
      <div className="font-poppins text-brown-600 dark:text-brown-300/75 accent:text-accent-muted flex flex-col items-center justify-center text-sm font-normal">
        {/* <p className="my-1 rounded-lg bg-zinc-800 p-1 px-3 text-zinc-50">
          {currentDate}
        </p> */}
        <p className="font-light">today</p>
        <p className="text-lg font-semibold">
          {hours} hr. {minutes} min.
        </p>
      </div>
    </>
  );
}
