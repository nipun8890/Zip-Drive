import React, { useState } from "react";
import type { CarDetailsType } from "../../types/CarDetails";
import "./CarTabs.css";

interface Feature {
  name: string;
  active: boolean;
}

interface Props {
  car: CarDetailsType;
}

const CarTabs: React.FC<Props> = ({ car }) => {
  const [activeTab, setActiveTab] = useState<
    "features" | "description" | "review"
  >("features");

  // Convert features into array
  let features: Feature[] = Array.isArray(car.features)
    ? car.features
    : Object.entries(car.features || {}).map(([name, active]) => ({
        name,
        active: Boolean(active),
      }));

  // Split into 3 columns
  const chunkSize = Math.ceil(features.length / 3);
  const columns = [
    features.slice(0, chunkSize),
    features.slice(chunkSize, chunkSize * 2),
    features.slice(chunkSize * 2),
  ];

  return (
    <div className="car-tabs-container">
      {/* Tabs header */}
      <div className="tabs-header">
        {["features", "description", "review"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="tab-content">
        {activeTab === "features" && (
          <div className="features-grid">
            {columns.map((column, idx) => (
              <ul key={idx} className="feature-column">
                {column.map((f, i) => (
                  <li
                    key={i}
                    className={`feature-item ${
                      f.active ? "active" : "inactive"
                    }`}
                  >
                    <span className="feature-icon">{f.active ? "✔" : "✘"}</span>
                    <span className="feature-name">{f.name}</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        )}

        {activeTab === "description" && (
          <p className="tab-description">
            {car.description || "No description available."}
          </p>
        )}

        {activeTab === "review" && (
          <p className="tab-description">No reviews yet</p>
        )}
      </div>
    </div>
  );
};

export default CarTabs;
