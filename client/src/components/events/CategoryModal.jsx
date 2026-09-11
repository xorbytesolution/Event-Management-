import React, { useState, useEffect } from "react";

export const CATEGORIES_LIST = [
  "Mens Wear",
  "Kids Wear",
  "Home Decor",
  "Handicrafts",
  "Organic Products",
  "Promotional Stalls",
  "Food Stalls",
  "Jewellery",
  "Bridal & Ethnic Wear",
  "Automobiles",
  "Sports Wear",
  "Fashion Accessories",
  "Devotional Products",
  "Footwear",
  "Stationary & Books",
  "Event Organizer",
  "Health & Medical",
  "Electronic Gadgets",
  "Kitchenware",
  "Women Wear",
  "Handmade Products",
  "Cosmetics & Beauty",
  "Startups",
  "Home Furnishing",
  "Real Estate",
  "Fitness Equipments",
  "Nutrition & Wellness",
  "Home Appliances",
  "Toys",
  "NGO's",
  "Others",
];

function CategoryModal({
  isOpen,
  onClose,
  onSave,
  initialSelected = [],
  hasError = false,
  error = "",
}) {
  const [selectedCategories, setSelectedCategories] = useState(initialSelected);

  useEffect(() => {
    setSelectedCategories(initialSelected);
  }, [initialSelected, isOpen]);

  if (!isOpen) return null;

  const isAllSelected = selectedCategories.length === CATEGORIES_LIST.length;

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategories([...CATEGORIES_LIST]);
    } else {
      setSelectedCategories([]);
    }
  };

  const handleToggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((item) => item !== category),
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleNext = () => {
    onSave(selectedCategories);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-[#2D3748] text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">Select Stall Categories</h3>

            <p className="text-xs text-gray-300">
              Choose all categories that apply to your event stalls
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
            {selectedCategories.length} Selected
          </span>
        </div>

        {/* Scrollable Checkbox Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {CATEGORIES_LIST.map((category) => {
            const checked = selectedCategories.includes(category);

            return (
              <label
                key={category}
                className={`flex items-center space-x-2.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
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
                  onChange={() => handleToggleCategory(category)}
                  className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500 accent-orange-600"
                />

                <span>{category}</span>
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

export default CategoryModal;
