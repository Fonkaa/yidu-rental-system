
import React from "react";
import "./StatCard.css";

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = "up",
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon">
          {icon}
        </div>

        {trend && (
          <span className={`stat-trend ${trendType}`}>
            {trendType === "up" ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>

      <div className="stat-card-content">
        <span className="stat-title">
          {title}
        </span>

        <h3 className="stat-value">
          {value}
        </h3>

        {subtitle && (
          <span className="stat-subtitle">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
