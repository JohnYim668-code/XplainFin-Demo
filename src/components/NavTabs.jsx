import React from "react";

const tabs = [
  { id: "dashboard", label: "Home / Dashboard" },
  { id: "lessons", label: "Lessons" },
  { id: "explore", label: "Explore with Pulse" },
  { id: "quiz", label: "Quiz / Challenges" }
];

export default function NavTabs({ activeTab, onTabChange }) {
  return (
    <nav className="tab-nav" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
