import "./Stats.css";

const stats = [
  { number: 3, label: "Year Experienced" },
  { number: 120, label: "Total Cars" },
  { number: 322, label: "Happy Customers" },
  { number: 4, label: "Cities Covered" },
];

export default function Stats() {
  return (
    <section className="stats-section">
      {/* Blue rectangle */}
      <div className="stats-bg"></div>

      {/* White stats box */}
      <div className="stats-box">
        {stats.map((item, index) => (
          <div className="stat-item" key={index}>
            <span className="stat-number">{item.number}</span>
            <span className="stat-label">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
