import clsx from "clsx";

export default function PageHeader({
  title,
  description,
  action,
  titleClassName,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 animate-fade-in">
      <div>
        <h1
          className={clsx(
            "text-2xl sm:text-3xl font-bold text-gray-900",
            titleClassName,
          )}
        >
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
