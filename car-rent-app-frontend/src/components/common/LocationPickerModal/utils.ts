// src/components/common/LocationPickerModal/utils.ts
export const extractCityFromLocationIQ = (data: any): string => {
  const address = data.address || {};
  return (
    address.city ||
    address.town ||
    address.village ||
    address.state_district ||
    address.county ||
    address.state ||
    ""
  );
};

export const formatShortAddress = (address: string): string => {
  if (!address) return "";
  return address.replace(/\s+/g, " ").trim();
};
