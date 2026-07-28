import { useState } from "react";
import type { CarFormData } from "../../types/Cars";
import { addInsurance } from "../../services/carService";

interface Props {
  onNext: (data: Partial<CarFormData>) => void;
  onBack: () => void;
  defaultValues: CarFormData;
  carId: number;
}

export default function Step3Insurance({
  onNext,
  onBack,
  defaultValues,
  carId,
}: Props) {
  const [insurance_company, setInsuranceCompany] = useState<string>(
    defaultValues.insurance_company || ""
  );
  const [insurance_idv_value, setInsuranceIdv] = useState<string>(
    defaultValues.insurance_idv_value?.toFixed(2) || "0.00"
  );
  const [insurance_valid_till, setInsuranceValidTill] = useState<string>(
    defaultValues.insurance_valid_till || ""
  );
  const [insurance_image, setInsuranceImage] = useState<File | undefined>(
    defaultValues.insurance_image
  );
  const [idvError, setIdvError] = useState<string>("");

  const handleIdvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input, decimals, and numbers
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setInsuranceIdv(value);
      // Validate against DECIMAL(10, 2) max (99999999.99)
      const numValue = parseFloat(value);
      if (value && (isNaN(numValue) || numValue > 99999999.99)) {
        setIdvError("IDV value must not exceed 99999999.99");
      } else {
        setIdvError("");
      }
    }
  };

  const handleNext = async () => {
    try {
      // Validate required fields
      if (!insurance_company) {
        throw new Error("Insurance company is required");
      }
      if (!insurance_idv_value) {
        throw new Error("Insurance IDV value is required");
      }
      const idvNumber = parseFloat(insurance_idv_value);
      if (isNaN(idvNumber) || idvNumber < 0) {
        throw new Error(
          "Insurance IDV value must be a valid non-negative number"
        );
      }
      if (idvNumber > 99999999.99) {
        throw new Error("Insurance IDV value must not exceed 99999999.99");
      }
      if (!insurance_valid_till) {
        throw new Error("Insurance valid till date is required");
      }
      if (!insurance_image) {
        throw new Error("Insurance image is required");
      }

      // Call backend API with individual fields
      await addInsurance({
        car_id: carId,
        insurance_company,
        insurance_idv_value: idvNumber,
        insurance_valid_till,
        insurance_image,
      });

      // Move to next step in wizard
      onNext({
        insurance_company,
        insurance_idv_value: idvNumber,
        insurance_valid_till,
        insurance_image,
      });
    } catch (error) {
      console.error("❌ Error saving insurance:", error);
      alert("Failed to save insurance details. Please try again.");
    }
  };

  return (
    <div>
      <label className="block mb-2">Insurance Company</label>
      <select
        value={insurance_company}
        onChange={(e) => setInsuranceCompany(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      >
        <option value="">Select Company</option>
        <option value="ICICI">ICICI</option>
        <option value="HDFC">HDFC</option>
        <option value="Bajaj">Bajaj</option>
      </select>

      <label className="block mb-2">Insurance IDV Value (Rs)</label>
      <input
        type="text"
        value={insurance_idv_value}
        onChange={handleIdvChange}
        className={`w-full border p-2 rounded mb-2 ${
          idvError ? "border-red-500" : ""
        }`}
        placeholder="Enter IDV value (e.g., 500000.00)"
      />
      {idvError && <p className="text-red-500 text-sm mb-2">{idvError}</p>}

      <label className="block mb-2">Insurance Valid Till</label>
      <input
        type="date"
        value={insurance_valid_till}
        onChange={(e) => setInsuranceValidTill(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />

      <label className="block mb-2">Upload Insurance</label>
      <input
        type="file"
        onChange={(e) => setInsuranceImage(e.target.files?.[0])}
        className="w-full border p-2 rounded mb-4"
      />

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="bg-gray-400 text-white px-4 py-2 rounded"
        >
          ← Back
        </button>
        &nbsp;&nbsp;&nbsp;
        <button
          onClick={handleNext}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={!!idvError}
        >
          Next Step →
        </button>
      </div>
    </div>
  );
}
