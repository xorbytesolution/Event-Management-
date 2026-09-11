const STALL_TYPES = [
  "Full Stall",
  "Half Stall",
  "Food Stall",
  "Special Stall",
  "Promotional Stall",
];

const STALL_MODELS = ["Open Table", "Canopy", "Octanorm", "Others"];

const emptyOption = () => ({
  stallType: "",
  tables: "",
  chairs: "",
  priceForEvent: "",
  pricePerDay: "",
});

function StallDetailsManager({
  stallSetup,
  setStallSetup,
  eventDays,
  validationErrors,
  onStallSetupChange,
}) {
  const updateSetup = (field, value) => {
    const updatedStallSetup = {
      ...stallSetup,
      [field]: value,
    };

    onStallSetupChange(updatedStallSetup, `stallSetup.${field}`);
  };

  const updateOption = (index, field, value) => {
    const options = [...stallSetup.options];

    options[index] = {
      ...options[index],
      [field]: value,
    };

    const updatedStallSetup = {
      ...stallSetup,
      options,
    };

    onStallSetupChange(
      updatedStallSetup,
      `stallSetup.options.${index}.${field}`,
    );
  };

  const getFieldError = (field) => validationErrors?.[field];

  const hasFieldError = (field) => Boolean(validationErrors?.[field]);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-2">
        <label className="text-sm font-bold text-gray-800 tracking-wide uppercase">
          Stall model & pricing
        </label>

        <p className="mt-1 text-xs text-gray-500">
          Choose one stall model for this event, then add every stall type and
          its pricing below.
        </p>
      </div>

      {/* STALL MODEL */}
      <fieldset>
        <legend className="block text-xs font-bold text-gray-700 mb-2">
          Stall Model <span className="text-red-500">*</span>
        </legend>

        <div className="flex flex-wrap gap-4">
          {STALL_MODELS.map((model) => (
            <label
              key={model}
              className="flex cursor-pointer items-center space-x-2"
            >
              <input
                type="radio"
                name="stallModel"
                value={model}
                checked={stallSetup.model === model}
                onChange={(event) => updateSetup("model", event.target.value)}
                className="h-4 w-4 accent-orange-600"
              />

              <span className="text-sm font-semibold text-gray-700">
                {model}
              </span>
            </label>
          ))}
        </div>

        {getFieldError("stallSetup.model") && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {getFieldError("stallSetup.model")}
          </p>
        )}
      </fieldset>

      {/* STALL DETAILS HEADER */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <label className="text-sm font-bold text-gray-800 tracking-wide uppercase">
          Stall Details
        </label>

        <span className="text-xs text-gray-500">
          {stallSetup.options.length}{" "}
          {stallSetup.options.length === 1 ? "type" : "types"} added
        </span>
      </div>

      {/* STALL OPTIONS */}
      {stallSetup.options.map((option, index) => {
        const stallTypeError = `stallSetup.options.${index}.stallType`;
        const tablesError = `stallSetup.options.${index}.tables`;
        const chairsError = `stallSetup.options.${index}.chairs`;
        const priceForEventError = `stallSetup.options.${index}.priceForEvent`;
        const pricePerDayError = `stallSetup.options.${index}.pricePerDay`;

        return (
          <div
            key={index}
            className="p-5 rounded-xl bg-orange-50/40 border border-orange-200/80 space-y-4 shadow-2xs"
          >
            {/* STALL HEADER */}
            <div className="flex justify-between items-center">
              <span className="text-xs font-extrabold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                Stall Type #{index + 1}
              </span>

              {stallSetup.options.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    updateSetup(
                      "options",
                      stallSetup.options.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    )
                  }
                  className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition"
                >
                  Remove
                </button>
              )}
            </div>

            {/* STALL TYPE / TABLES / CHAIRS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* STALL TYPE */}
              <label className="block text-xs font-semibold text-gray-700">
                Stall Type <span className="text-red-500">*</span>
                <select
                  value={option.stallType}
                  onChange={(event) =>
                    updateOption(index, "stallType", event.target.value)
                  }
                  className={`mt-1 w-full text-sm rounded-lg px-3 py-2 outline-none transition ${
                    hasFieldError(stallTypeError)
                      ? "border border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                      : "border border-gray-300 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
                  }`}
                >
                  <option value="" disabled>
                    Select Stall Type
                  </option>
                  {STALL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {getFieldError(stallTypeError) && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {getFieldError(stallTypeError)}
                  </p>
                )}
              </label>

              {/* TABLES / CHAIRS */}
              <div className="grid grid-cols-2 gap-3">
                {/* TABLES */}
                <label className="block text-xs font-semibold text-gray-700">
                  Tables
                  <select
                    value={option.tables}
                    onChange={(event) =>
                      updateOption(index, "tables", event.target.value)
                    }
                    className={`mt-1 w-full text-sm rounded-lg px-3 py-2 outline-none transition ${
                      hasFieldError(tablesError)
                        ? "border border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                        : "border border-gray-300 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
                    }`}
                  >
                    <option value="" disabled>
                      Select Tables
                    </option>

                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                      <option key={number} value={number}>
                        {number}
                      </option>
                    ))}
                  </select>
                  {getFieldError(tablesError) && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {getFieldError(tablesError)}
                    </p>
                  )}
                </label>

                {/* CHAIRS */}
                <label className="block text-xs font-semibold text-gray-700">
                  Chairs
                  <select
                    value={option.chairs}
                    onChange={(event) =>
                      updateOption(index, "chairs", event.target.value)
                    }
                    className={`mt-1 w-full text-sm rounded-lg px-3 py-2 outline-none transition ${
                      hasFieldError(chairsError)
                        ? "border border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                        : "border border-gray-300 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
                    }`}
                  >
                    <option value="" disabled>
                      Select Chairs
                    </option>

                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
                      <option key={number} value={number}>
                        {number}
                      </option>
                    ))}
                  </select>
                  {getFieldError(chairsError) && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {getFieldError(chairsError)}
                    </p>
                  )}
                </label>
              </div>
            </div>

            {/* PRICING */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PRICE FOR EVENT */}
              <label className="block text-xs font-semibold text-gray-700">
                Price for {eventDays} {eventDays === 1 ? "Day" : "Days"} (₹){" "}
                <span className="text-red-500">*</span>
                <input
                  min="0"
                  type="number"
                  value={option.priceForEvent}
                  onChange={(event) =>
                    updateOption(index, "priceForEvent", event.target.value)
                  }
                  className={`mt-1 w-full text-sm rounded-lg px-3 py-2 outline-none transition ${
                    hasFieldError(priceForEventError)
                      ? "border border-red-400 bg-red-50 placeholder:text-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                      : "border border-gray-300 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e") {
                      e.preventDefault();
                    }
                  }}
                />
                {getFieldError(priceForEventError) && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {getFieldError(priceForEventError)}
                  </p>
                )}
              </label>

              {/* PRICE PER DAY */}
              <label className="block text-xs font-semibold text-gray-700">
                Price for 1 Day (₹)
                <input
                  min="0"
                  type="number"
                  placeholder="Optional"
                  value={option.pricePerDay}
                  onChange={(event) =>
                    updateOption(index, "pricePerDay", event.target.value)
                  }
                  className={`mt-1 w-full text-sm rounded-lg px-3 py-2 outline-none transition ${
                    hasFieldError(pricePerDayError)
                      ? "border border-red-400 bg-red-50 placeholder:text-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-500/15"
                      : "border border-gray-300 bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/15"
                  }`}
                />
                {getFieldError(pricePerDayError) && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {getFieldError(pricePerDayError)}
                  </p>
                )}
              </label>
            </div>
          </div>
        );
      })}

      {/* ADD STALL */}
      <button
        type="button"
        onClick={() =>
          updateSetup("options", [...stallSetup.options, emptyOption()])
        }
        className="w-full py-2.5 border-2 border-dashed border-orange-400 hover:border-orange-500 bg-orange-50/50 hover:bg-orange-50 text-orange-700 font-bold text-sm rounded-xl transition"
      >
        + Add More Stall Type
      </button>
    </div>
  );
}

export default StallDetailsManager;
