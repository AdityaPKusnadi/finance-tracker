'use client';

const SummaryCard = ({ title, amount, currency, icon, bgClass, textClass }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl p-4 ${bgClass || 'bg-card'}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className={`text-xl md:text-2xl font-bold ${textClass}`}>
            {typeof amount === 'number' 
              ? amount.toLocaleString(undefined, { style: 'currency', currency })
              : amount}
          </p>
        </div>
        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${bgClass ? 'bg-white/20' : 'bg-secondary/50'}`}>
          {icon}
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 opacity-10">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        </svg>
      </div>
    </div>
  );
};

export default SummaryCard;
