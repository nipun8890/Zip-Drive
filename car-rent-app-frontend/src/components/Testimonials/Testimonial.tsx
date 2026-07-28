import { useState } from "react";
import "./Testimonial.css";

import user1 from "../../assets/testimonials_image/amit.jpeg";
import user2 from "../../assets/testimonials_image/ankit.jfif";
import user3 from "../../assets/testimonials_image/shubham.jfif";
import user4 from "../../assets/testimonials_image/krishanu.jpeg";
import user5 from "../../assets/testimonials_image/mohit.jpeg";
import user6 from "../../assets/testimonials_image/roger.jfif";

import type { Testimonial } from "../../types/Testimonial";

export default function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      img: user1,
      place: "Visited family (Feb 2025)",
      text: "No more waiting for cabs good service, Will use again!",
      name: "Amit Garg",
      role: "CEO AMM GmbH, Hamburg",
    },
    {
      img: user2,
      place: "Visited Family (Feb 2025)",
      text: "Seamless experience of renting a self-driven car through Zipdrive. Host Dropped the car at airport . Cozy car-easy Zipping",
      name: "Ankit Jain",
      role: "Travel Consultant, Melbourne",
    },
    {
      img: user3,
      place: "Visited Delhi (Dec 2024)",
      text: "Seamless experience of renting a self-driven car through Zipdrive. Host Dropped the car at airport . Cozy car-easy Zipping",
      name: "Shubham Mishra",
      role: "Director At Novartris, Dublin",
    },
    {
      img: user4,
      place: "NCR Delhi (Feb 2025)",
      text: "I had to come to India for my visa renewal. Zip Drive helped me with the car for 15 days. Excellent customer focus and service.",
      name: "Krishanu",
      role: "Engineer, US",
    },
    {
      img: user5,
      place: "Visited Mahakumbh (Feb 2025)",
      text: "I was always looking for reliable company to get a self driven cars. Delighted i found Zip Drive . Timely Pick/Drop service and clean car made my experience smooth.",
      name: "Mohit Jain",
      role: "Marketing Manager, Dubai",
    },
    {
      img: user6,
      place: "Wah Taj-with family (jan 2025)",
      text: "Driving is fun in india with excellent expressways now but middle of the trip i needed a chauffeur to help me through the narrow lanes in Delhi. Happy that zipdrive could prompty help. highly recommended.",
      name: "Roger Scott",
      role: "Tourist, UK",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const visibleTestimonials = testimonials.slice(activeIndex, activeIndex + 3);

  const handleNext = () => {
    if (activeIndex < testimonials.length - 3) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  return (
    <section className="testimonials-section" id="testimonials">
      <h5 className="section-subtitle">TESTIMONIALS</h5>
      <h2 className="section-title">Happy Zippers !</h2>

      <div className="testimonial-container">
        {visibleTestimonials.map((t, i) => (
          <div className="testimonial-card" key={i}>
            <img src={t.img} alt={t.name} className="testimonial-img" />
            <h4 className="testimonial-place">{t.place}</h4>
            <p className="testimonial-text">{t.text}</p>
            <h3 className="testimonial-name">{t.name}</h3>
            <span className="testimonial-role">{t.role}</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="testimonial-controls">
        <button onClick={handlePrev} disabled={activeIndex === 0}>
          ◀
        </button>
        <button
          onClick={handleNext}
          disabled={activeIndex >= testimonials.length - 3}
        >
          ▶
        </button>
      </div>
    </section>
  );
}
