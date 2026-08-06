type Props = {
  title: string;
  subtitle: string;
};

export default function ActivityCard({
  title,
  subtitle,
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div>
        <h3 className="font-semibold text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm text-slate-400">
          {subtitle}
        </p>
      </div>

      <div className="h-3 w-3 rounded-full bg-green-500"></div>
    </div>
  );
}