import React, { useState, useEffect } from "react";

export const FACILITIES_LIST = [
  "Water",
  "Tea/Coffee",
  "Parking",
  "Toilets",
  "AC",
  "Food",
  "Power",
  "Light",
];

function FacilityModal({
  isOpen,
  onClose,
  onSave,
  initialSelected = [],
  hasError = false,
  error = "",
}) {
  const [selectedFacilities, setSelectedFacilities] = useState(initialSelected);

  useEffect(() => {
    setSelectedFacilities(initialSelected);
  }, [initialSelected, isOpen]);

  if (!isOpen) return null;

  const isAllSelected = selectedFacilities.length === FACILITIES_LIST.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedFacilities([...FACILITIES_LIST]);
    } else {
      setSelectedFacilities([]);
    }
  };

  const handleToggleFacility = (facility) => {
    if (selectedFacilities.includes(facility)) {
      setSelectedFacilities(
        selectedFacilities.filter((item) => item !== facility),
      );
    } else {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
  };

  const handleNext = () => {
    onSave(selectedFacilities);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#2D3748] text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Select Facilities</h3>

            <p className="text-xs text-gray-300">
              Choose amenities provided at the venue
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl font-bold p-1 rounded-md transition"
          >
            ✕
          </button>
        </div>

        {/* Select All Checkbox Bar */}
        <div
          className={`px-6 py-3 flex justify-between items-center border-b ${
            hasError
              ? "bg-red-50 border-red-200"
              : "bg-orange-50 border-orange-100"
          }`}
        >
          <label className="flex items-center space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
              className={`w-4 h-4 rounded focus:ring-orange-500 accent-orange-600 ${
                hasError ? "border-red-400" : "border-gray-300"
              }`}
            />

            <span className="font-bold text-sm text-gray-800">Select All</span>
          </label>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              hasError
                ? "text-red-700 bg-red-200/60"
                : "text-orange-700 bg-orange-200/60"
            }`}
          >
            {selectedFacilities.length} Selected
          </span>
        </div>

        {/* Facilities Checkbox Grid */}
        <div className="p-6 grid grid-cols-2 gap-3">
          {FACILITIES_LIST.map((facility) => {
            const checked = selectedFacilities.includes(facility);

            return (
              <label
                key={facility}
                className={`flex items-center space-x-2.5 p-3 rounded-xl border text-sm font-medium cursor-pointer transition select-none ${
                  checked
                    ? "bg-orange-50/80 border-orange-400 text-orange-900 shadow-2xs font-semibold"
                    : hasError
                      ? "bg-red-50/30 border-red-200 text-gray-700 hover:bg-red-50"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggleFacility(facility)}
                  className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 accent-orange-600"
                />

                <span>{facility}</span>
              </label>
            );
          })}
        </div>

        {/* Error Message */}
        {hasError && error && (
          <div className="px-6 pb-3">
            <p className="text-xs font-medium text-red-600">{error}</p>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-200 transition"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 rounded-lg text-sm font-bold bg-[#F25C05] hover:bg-orange-600 text-white shadow-md transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default FacilityModal;
