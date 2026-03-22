import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No results found', message = 'Try adjusting your filters', icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center mb-5 shadow-inner">
        <Icon className="w-9 h-9 text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm text-gray-500 max-w-sm leading-relaxed">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
