import { motion } from 'framer-motion';

interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function PriorityBadge({ 
  priority, 
  className = '', 
  size = 'md',
  showIcon = true 
}: PriorityBadgeProps) {
  const priorityConfig = {
    low: {
      label: 'Low',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50/80 backdrop-blur-sm',
      textColor: 'text-green-700',
      borderColor: 'border-green-200/60',
      icon: '↓',
      glow: 'shadow-green-200/50'
    },
    medium: {
      label: 'Medium',
      color: 'from-amber-400 to-yellow-500',
      bgColor: 'bg-amber-50/80 backdrop-blur-sm',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200/60',
      icon: '→',
      glow: 'shadow-amber-200/50'
    },
    high: {
      label: 'High',
      color: 'from-orange-400 to-red-500',
      bgColor: 'bg-orange-50/80 backdrop-blur-sm',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200/60',
      icon: '↑',
      glow: 'shadow-orange-200/50'
    },
    urgent: {
      label: 'Urgent',
      color: 'from-red-500 to-rose-600',
      bgColor: 'bg-red-50/80 backdrop-blur-sm',
      textColor: 'text-red-700',
      borderColor: 'border-red-200/60',
      icon: '⚡',
      glow: 'shadow-red-200/50'
    }
  };

  const sizeConfig = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = priorityConfig[priority];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, y: -1 }}
      className={`
        inline-flex items-center rounded-full font-semibold border backdrop-blur-sm
        ${config.bgColor} ${config.textColor} ${config.borderColor} 
        ${sizeConfig[size]} ${config.glow} shadow-sm hover:shadow-md
        transition-all duration-200 cursor-pointer ${className}
      `}
    >
      {/* Animated gradient dot */}
      <motion.span 
        className={`w-2 h-2 rounded-full bg-gradient-to-r ${config.color} mr-2 shadow-sm`}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      
      {/* Priority icon */}
      {showIcon && (
        <motion.span 
          className="mr-1.5 font-bold"
          whileHover={{ scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {config.icon}
        </motion.span>
      )}
      
      {config.label}
    </motion.div>
  );
}