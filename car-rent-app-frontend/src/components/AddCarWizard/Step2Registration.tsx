// Step2Registration.tsx
import { useState } from "react";
import type { CarFormData } from "../../types/Cars";
import { uploadRC } from "../../services/carService";
import "./Step2Registration.css";

interface Props {
  onNext: (data: Partial<CarFormData>) => void;
  onBack: () => void;
  defaultValues: CarFormData;
  carId: number;
}

export default function Step2Registration({
  onNext,
  onBack,
  defaultValues,
  carId,
}: Props) {
  const [ownerName, setOwnerName] = useState(defaultValues.ownerName || "");
  const [registrationNo, setRegistrationNo] = useState(
    defaultValues.registrationNo || ""
  );
  const [cityOfRegistration, setCityOfRegistration] = useState(
    defaultValues.cityOfRegistration || ""
  );
  const [rcValidTill, setRcValidTill] = useState(
    defaultValues.rcValidTill || ""
  );
  const [rcFrontFile, setRcFrontFile] = useState<File | undefined>(
    defaultValues.rcFrontFile
  );
  const [rcBackFile, setRcBackFile] = useState<File | undefined>(
    defaultValues.rcBackFile
  );
  const [loading, setLoading] = useState(false);

  const [handType, setHandType] = useState<"First" | "Second">(
    defaultValues.handType || "First"
  );

  const [registrationType, setRegistrationType] = useState<
    "Private" | "Commercial"
  >(defaultValues.registrationType || "Private");

  const handleNext = async () => {
    if (!rcFrontFile || !rcBackFile) {
      alert("Please upload both RC front and back images.");
      return;
    }

    try {
      setLoading(true);

      const response = await uploadRC({
        car_id: carId,
        owner_name: ownerName,
        rc_number: registrationNo,
        rc_valid_till: rcValidTill,
        city_of_registration: cityOfRegistration,
        rc_image_front: rcFrontFile,
        rc_image_back: rcBackFile,
        hand_type: handType,
        registration_type: registrationType,
      });

      console.log("✅ RC Upload Response:", response);

      onNext({
        ownerName,
        registrationNo,
        cityOfRegistration,
        rcValidTill,
        rcFrontFile,
        rcBackFile,
        handType,
        registrationType,
      });
    } catch (err) {
      console.error("❌ Error uploading RC:", err);
      alert("Failed to upload RC details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="block mb-2">Owner Name (as in RC)</label>
      <input
        type="text"
        value={ownerName}
        onChange={(e) => setOwnerName(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />
      <label className="block mb-2">Registration No</label>
      <input
        type="text"
        value={registrationNo}
        onChange={(e) => setRegistrationNo(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />
      <label className="block mb-2">Car Location</label>
      <select
        value={cityOfRegistration}
        onChange={(e) => setCityOfRegistration(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      >
        <option value="">Select City</option>
        <option value="Delhi">Delhi</option>
        <option value="Agra">Agra</option>
        <option value="Noida">Noida</option>
        <option value="Meerat">Meerat</option>
        <option value="Gurgoan">Gurgoan</option>
      </select>
      <label className="block mb-2">RC Valid Till</label>
      <input
        type="date"
        value={rcValidTill}
        onChange={(e) => setRcValidTill(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />
      <label className="block mb-2">Car Hand Type</label>
      <div className="step2-toggle-wrapper mb-4">
        <span className="step2-toggle-label">First Hand</span>
        <input
          type="checkbox"
          className="step2-toggle-switch"
          checked={handType === "Second"}
          onChange={() =>
            setHandType((prev) => (prev === "First" ? "Second" : "First"))
          }
        />
        <span className="step2-toggle-label">Second Hand</span>
      </div>

      <label className="block mb-2">Registration Type</label>
      <select
        value={registrationType}
        onChange={(e) =>
          setRegistrationType(e.target.value as "Private" | "Commercial")
        }
        className="w-full border p-2 rounded mb-4"
      >
        <option value="Private">Private</option>
        <option value="Commercial">Commercial</option>
      </select>
      <label className="block mb-2">Upload RC Front</label>
      <input
        type="file"
        onChange={(e) => setRcFrontFile(e.target.files?.[0])}
        className="w-full border p-2 rounded mb-4"
      />
      <label className="block mb-2">Upload RC Back</label>
      <input
        type="file"
        onChange={(e) => setRcBackFile(e.target.files?.[0])}
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
          disabled={loading}
        >
          {loading ? "Uploading..." : "Next Step →"}
        </button>
      </div>
    </div>
  );
}
