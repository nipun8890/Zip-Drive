import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import type { Car } from "../../types/Cars";
import Navbar from "../../components/Navbar/Navbar";
import { getCars } from "../../services/carService";
import { useNavigate } from "react-router-dom";

const Cars: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getCars();
        setCars(data);
      } catch (error) {
        console.error("❌ Error fetching cars:", error);
      }
    };
    fetchCars();
  }, []);

  const handleBookNowClick = (car: Car) => {
    navigate("/bookAcar", {
      state: {
        carId: car.id,
        pricePerHour: car.price,
        carLocation: car.location, // ✅ Added location
      },
    });
  };

  const handleDetailsClick = (id: number) => {
    navigate(`/car-details/${id}`);
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <h2 className="text-center mb-4 fw-bold">Available Cars</h2>
        <div className="row g-4">
          {cars.map((car) => (
            <div key={car.id} className="col-sm-6 col-md-4">
              <div className="card shadow-sm h-100">
                <div className="card-img-container">
                  <img
                    src={car.image ?? ""}
                    className="card-img-top"
                    alt={car.name}
                    onError={() =>
                      console.error("🖼️ Image not loading:", car.image)
                    }
                  />
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{car.name}</h5>
                  <p className="card-text text-muted">
                    {car.brand}, {car.year}
                  </p>
                  <p className="fw-bold text-primary mb-3">
                    INR {car.price} <small>/hour</small>
                  </p>
                  <div className="mt-auto d-flex gap-2">
                    <button
                      className="btn btn-primary flex-fill"
                      onClick={() => handleBookNowClick(car)}
                    >
                      Book now
                    </button>
                    <button
                      className="btn btn-success flex-fill"
                      onClick={() => handleDetailsClick(car.id)}
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Cars;
