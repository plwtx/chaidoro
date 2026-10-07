/* Short points with a dash marker, in the style of the Information page lists. */
export default function PointList({ points }: { points: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {points.map((point) => (
        <li
          key={point}
          className="text-brown-800 dark:text-dark-100/85 flex gap-3 text-sm leading-6"
        >
          <span
            aria-hidden="true"
            className="text-brown-500 dark:text-dark-100/50 select-none"
          >
            -
          </span>
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}
