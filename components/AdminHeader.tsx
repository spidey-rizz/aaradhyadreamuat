import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description: string;
  Icon: LucideIcon;
  iconClassName?: string;
  iconOpacityClassName?: string;
  cardClassName?: string;
  style?: React.CSSProperties;
}

export default function AdminHeader({
  title,
  description,
  Icon,
  iconClassName = "text-primary",
  iconOpacityClassName = "opacity-5",
  cardClassName = "border-border",
  style,
}: AdminHeaderProps) {
  return (
    <div
      className={`bg-card border rounded-3xl p-8 shadow-sm mb-6 relative overflow-hidden ${cardClassName}`}
      style={style}
    >
      <div className={`absolute top-0 right-0 p-4 ${iconOpacityClassName}`}>
        <Icon size={120} className={iconClassName} />
      </div>
      <h1 className={`text-3xl sm:text-4xl font-black uppercase tracking-tight mb-2 relative z-10 ${iconClassName}`}>
        {title}
      </h1>
      <p className="text-muted-foreground font-medium relative z-10">{description}</p>
    </div>
  );
}
