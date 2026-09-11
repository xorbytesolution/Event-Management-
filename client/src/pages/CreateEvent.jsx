import React, { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, UserCheck, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import CategoryModal from "../components/events/CategoryModal";
import FacilityModal from "../components/events/FacilityModal";
import StallDetailsManager from "../components/events/StallDetailsManager";
import DateTimePicker from "../components/common/DateTimePicker";
import api from "../services/api";
import { eventSubmissionSchema } from "../validations/eventSubmission.validation";

const INDIAN_CITIES = [
  "Hyderabad",
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Chennai",
  "Pune",
  "Noida",
  "Jaipur",
  "Lucknow",
  "Kolkata",
  "Gurgaon",
  "Ahmedabad",
  "Chandigarh",
  "Rajasthan",
  "Akola",
  "Ghaziabad",
  "Ranchi",
  "Ludhiana",
  "Kochi",
  "Indore",
  "Surat",
  "Bhopal",
  "Coimbatore",
  "Visakhapatnam",
];

const VENUE_TYPES = [
  "Apartments",
  "Open Ground",
  "Tech Parks",
  "Street Fair",
  "Hotels",
  "Banquet Halls",
  "Malls and Complexes",
  "Convention Centres",
  "Premium Venues",
  "Social Clubs",
  "College & Universities",
];

function CreateEvent() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const posterInputRef = useRef(null);
  const floorPlanInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    mobileNumber: user?.phone || "",
    organiserName: user?.name || "",
    organizerEmail: user?.email || "",
    city: "",
    eventName: "",
    eventVenue: "",
    venueType: "",
    eventType: "", // Indoor, Outdoor, Both
    startingDate: "",
    endingDate: "",
    totalStalls: "",
    availableStalls: "",
    visitorCount: "",
    moreDetail: "",
    eventHighlights: "",
  });

  // Automatically pre-fill organizer details if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        organiserName: prev.organiserName || user.name || "",
        organizerEmail: user.email || prev.organizerEmail || "",
        mobileNumber: user.phone || prev.mobileNumber || "",
      }));
    }
  }, [user]);

  // Dynamic Stall Details Array (up to 5 sets)
  const [stallSetup, setStallSetup] = useState({
    model: "",
    options: [
      {
        stallType: "",
        tables: "",
        chairs: "",
        priceForEvent: "",
        pricePerDay: "",
      },
    ],
  });

  // Categories & Facilities Modal States
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [showAllFacilities, setShowAllFacilities] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isFacilityModalOpen, setIsFacilityModalOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Image Upload Previews
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [floorPlanFile, setFloorPlanFile] = useState(null);
  const [floorPlanPreview, setFloorPlanPreview] = useState("");

  // Submit state & Toast feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Calculate Event Duration in Days
  const eventDays = useMemo(() => {
    if (!formData.startingDate || !formData.endingDate) return 0;
    const start = new Date(formData.startingDate);
    const end = new Date(formData.endingDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

    const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    const diffTime = endDateOnly - startDateOnly;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive of start day
    return diffDays > 0 ? diffDays : 1;
  }, [formData.startingDate, formData.endingDate]);

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const todayDate = getTodayDate();

  const validateFormFields = (updatedFormData, fieldNames) => {
    const validationData = {
      ...updatedFormData,
      categories: selectedCategories,
      facilities: selectedFacilities,
      stallSetup,
    };

    const result = eventSubmissionSchema.safeParse(validationData);

    const errors = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path.join(".");

        if (fieldNames.includes(fieldName) && !errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      });
    }

    return errors;
  };

  const handleStallSetupChange = (updatedStallSetup, fieldPath) => {
    const validationData = {
      ...formData,
      categories: selectedCategories,
      facilities: selectedFacilities,
      stallSetup: updatedStallSetup,
    };

    const result = eventSubmissionSchema.safeParse(validationData);

    const fieldErrors = {};

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");

        if (path === fieldPath && !fieldErrors[path]) {
          fieldErrors[path] = issue.message;
        }
      });
    }

    setValidationErrors((prev) => {
      const updatedErrors = { ...prev };

      if (fieldErrors[fieldPath]) {
        updatedErrors[fieldPath] = fieldErrors[fieldPath];
      } else {
        delete updatedErrors[fieldPath];
      }

      return updatedErrors;
    });

    setStallSetup(updatedStallSetup);
  };

  const validateSelectionField = (fieldName, value) => {
    const validationData = {
      ...formData,
      categories: fieldName === "categories" ? value : selectedCategories,
      facilities: fieldName === "facilities" ? value : selectedFacilities,
      stallSetup,
    };

    const result = eventSubmissionSchema.safeParse(validationData);

    let errorMessage = "";

    if (!result.success) {
      const issue = result.error.issues.find(
        (issue) => issue.path.join(".") === fieldName,
      );

      if (issue) {
        errorMessage = issue.message;
      }
    }

    setValidationErrors((prev) => {
      const updatedErrors = { ...prev };

      if (errorMessage) {
        updatedErrors[fieldName] = errorMessage;
      } else {
        delete updatedErrors[fieldName];
      }

      return updatedErrors;
    });
  };

  const handleCategoriesSave = (categories) => {
    setSelectedCategories(categories);

    validateSelectionField("categories", categories);
  };

  const handleFacilitiesSave = (facilities) => {
    setSelectedFacilities(facilities);

    validateSelectionField("facilities", facilities);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Prevent modifying locked contact fields when logged in
    if (user && (name === "mobileNumber" || name === "organizerEmail")) {
      return;
    }

    let updatedValue = value;

    const numberFields = ["totalStalls", "availableStalls", "visitorCount"];

    if (numberFields.includes(name)) {
      updatedValue = value.replace(/\D/g, "");
    }

    // Mobile number: only digits, maximum 10
    if (name === "mobileNumber") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    const updatedFormData = {
      ...formData,
      [name]: updatedValue,
    };

    setFormData(updatedFormData);

    // Normal fields validate themselves.
    // Dates validate BOTH dates because they depend on each other.
    // Total/Available stalls validate BOTH fields because they depend on each other.
    let fieldsToValidate = [name];

    if (
      (name === "startingDate" || name === "endingDate") &&
      updatedFormData.startingDate &&
      updatedFormData.endingDate
    ) {
      fieldsToValidate = ["startingDate", "endingDate"];
    }

    if (name === "totalStalls" || name === "availableStalls") {
      fieldsToValidate = ["totalStalls", "availableStalls"];
    }

    const fieldErrors = validateFormFields(updatedFormData, fieldsToValidate);

    setValidationErrors((prev) => {
      const updatedErrors = { ...prev };

      fieldsToValidate.forEach((field) => {
        if (fieldErrors[field]) {
          updatedErrors[field] = fieldErrors[field];
        } else {
          delete updatedErrors[field];
        }
      });

      return updatedErrors;
    });
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      setPosterPreview(URL.createObjectURL(file));
    }
  };

  const handleFloorPlanChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFloorPlanFile(file);
      setFloorPlanPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");
    setValidationErrors({});

    const validationData = {
      ...formData,
      categories: selectedCategories,
      facilities: selectedFacilities,
      stallSetup,
    };

    // -------------------------
    // Frontend validation
    // -------------------------
    const validationResult = eventSubmissionSchema.safeParse(validationData);

    if (!validationResult.success) {
      const errors = {};

      validationResult.error.issues.forEach((issue) => {
        const path = issue.path;

        if (path.length === 1) {
          errors[path[0]] = issue.message;
        } else {
          errors[path.join(".")] = issue.message;
        }
      });

      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // -------------------------
      // Prepare API payload
      // -------------------------
      const payload = new FormData();

      payload.append("organizerName", formData.organiserName);
      payload.append("organizerPhone", formData.mobileNumber);
      payload.append("organizerEmail", formData.organizerEmail);
      payload.append("city", formData.city);
      payload.append("title", formData.eventName);
      payload.append("venue", formData.eventVenue);
      payload.append("venueType", formData.venueType);
      payload.append("eventType", formData.eventType.toLowerCase());
      payload.append("startDate", formData.startingDate);
      payload.append("endDate", formData.endingDate);

      payload.append("totalStalls", String(Number(formData.totalStalls)));

      payload.append(
        "availableStalls",
        String(Number(formData.availableStalls)),
      );

      payload.append("expectedVisitors", String(formData.visitorCount || ""));

      payload.append("description", formData.moreDetail);
      payload.append("highlights", formData.eventHighlights);

      payload.append("categories", JSON.stringify(selectedCategories));

      payload.append("facilities", JSON.stringify(selectedFacilities));

      payload.append(
        "stallSetup",
        JSON.stringify({
          model: stallSetup.model,
          options: stallSetup.options.map((option) => ({
            ...option,
            tables: option.tables === "" ? "" : Number(option.tables),
            chairs: option.chairs === "" ? "" : Number(option.chairs),
            priceForEvent: Number(option.priceForEvent),
            pricePerDay:
              option.pricePerDay === "" ? null : Number(option.pricePerDay),
          })),
        }),
      );

      // -------------------------
      // Images
      // -------------------------
      if (posterFile) {
        payload.append("posterImage", posterFile);
      }

      if (floorPlanFile) {
        payload.append("floorPlanImage", floorPlanFile);
      }

      // -------------------------
      // API request
      // -------------------------
      await api.post("/event-submissions", payload);

      setIsSubmitting(false);
      setSubmitSuccess(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      setIsSubmitting(false);

      const backendErrors = error.response?.data?.errors;

      // -------------------------
      // Field-level backend errors
      // -------------------------
      if (Array.isArray(backendErrors)) {
        const errors = {};

        backendErrors.forEach((issue) => {
          const path = issue.path || [];

          if (path.length === 1) {
            errors[path[0]] = issue.message;
          } else if (path.length > 1) {
            errors[path.join(".")] = issue.message;
          }
        });

        if (Object.keys(errors).length > 0) {
          setValidationErrors(errors);
          return;
        }
      }

      // -------------------------
      // Mongoose field errors
      // -------------------------
      if (
        backendErrors &&
        typeof backendErrors === "object" &&
        !Array.isArray(backendErrors)
      ) {
        setValidationErrors(backendErrors);
        return;
      }

      // -------------------------
      // General backend/application/server error
      // -------------------------
      setSubmitError(
        error.response?.data?.message ||
          "We could not submit your event. Please try again.",
      );
    }
  };

  const getFieldError = (field) => validationErrors[field];

  const hasFieldError = (field) => Boolean(validationErrors[field]);

  // Reusable error-aware styling for form controls.
  const getInputClass = (fieldName, rounded = "rounded-lg") => `
    w-full ${rounded} border
    ${
      hasFieldError(fieldName)
        ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-red-500/15"
        : "border-slate-300 bg-slate-50 focus:border-orange-500 focus:bg-white focus:ring-orange-500/15"
    }
    px-3.5 py-2.5 text-sm text-slate-900 outline-none transition
    placeholder:text-slate-400 hover:border-slate-400 focus:ring-2
  `;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header Banner */}
          <div className="border-b border-slate-700 bg-slate-900 px-6 py-7 text-white sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-orange-400">
                    Event Management
                  </span>
                </div>

                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                  Create Event
                </h1>

                <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-slate-400">
                  Publish your event and connect with exhibitors across India.
                </p>
              </div>

              <Link
                to="/"
                className="inline-flex w-fit items-center rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-orange-500 hover:bg-slate-800 hover:text-white"
              >
                ← Back to Home
              </Link>
            </div>
          </div>

          {submitSuccess ? (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                ✓
              </div>

              <h2 className="text-2xl font-bold text-gray-800">
                Event Created Successfully!
              </h2>

              <p className="text-sm text-gray-600 max-w-md mx-auto">
                Your event{" "}
                <span className="font-semibold text-gray-900">
                  "{formData.eventName}"
                </span>{" "}
                has been submitted for review. It will be live shortly.
              </p>

              <div className="pt-4 flex justify-center space-x-4">
                <button
                  onClick={() => navigate("/")}
                  className="bg-[#F25C05] hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition"
                >
                  Go to Homepage
                </button>

                <button
                  onClick={() => {
                    setSubmitSuccess(false);
                    setValidationErrors({});
                    setSubmitError("");

                    setFormData({
                      mobileNumber: user?.phone || "",
                      organiserName: user?.name || "",
                      organizerEmail: user?.email || "",
                      city: "",
                      eventName: "",
                      eventVenue: "",
                      venueType: "",
                      eventType: "",
                      startingDate: "",
                      endingDate: "",
                      totalStalls: "",
                      availableStalls: "",
                      visitorCount: "",
                      moreDetail: "",
                      eventHighlights: "",
                    });

                    setStallSetup({
                      model: "",
                      options: [
                        {
                          stallType: "",
                          tables: "",
                          chairs: "",
                          priceForEvent: "",
                          pricePerDay: "",
                        },
                      ],
                    });

                    setSelectedCategories([]);
                    setSelectedFacilities([]);
                    setPosterFile(null);
                    setPosterPreview("");
                    setFloorPlanFile(null);
                    setFloorPlanPreview("");
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition"
                >
                  Create Another Event
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="p-6 sm:p-10 space-y-8"
            >
              {submitError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {submitError}
                </div>
              )}

              {/* SECTION 1: BASIC INFORMATION */}
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 pb-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-orange-600">
                    1. Basic Information
                  </h3>
                  {user && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                      <UserCheck size={13} />
                      Connected to {user.roles?.includes("organizer") ? "Organizer" : "User"} Account
                    </span>
                  )}
                </div>

                {/* Logged-In User Identity Card */}
                {user && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50/70 p-4 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white font-extrabold text-sm shadow-xs">
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">
                            Submitting as {user.name}
                          </p>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            Verified Account
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          This event will be linked directly to your dashboard under{" "}
                          <span className="font-semibold text-slate-900 font-mono">{user.email}</span>
                          {user.phone ? (
                            <> · <span className="font-semibold text-slate-900">{user.phone}</span></>
                          ) : null}.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-[11px] text-slate-500">Not you?</span>
                      <button
                        type="button"
                        onClick={async () => {
                          await logout();
                          setFormData((prev) => ({
                            ...prev,
                            mobileNumber: "",
                            organizerEmail: "",
                            organiserName: "",
                          }));
                        }}
                        className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        <LogOut size={13} />
                        Log out
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* 1. Mobile Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      {user && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <Lock size={12} />
                          Locked to account
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="tel"
                        name="mobileNumber"
                        required
                        maxLength={10}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter 10-digit mobile number"
                        value={formData.mobileNumber}
                        readOnly={Boolean(user && user.phone)}
                        onChange={handleInputChange}
                        className={`${getInputClass("mobileNumber")} ${
                          user && user.phone
                            ? "bg-slate-100/90 text-slate-600 cursor-not-allowed pr-9 border-slate-200"
                            : ""
                        }`}
                      />
                      {user && user.phone && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                          <Lock size={15} />
                        </div>
                      )}
                    </div>

                    {getFieldError("mobileNumber") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {getFieldError("mobileNumber")}
                      </p>
                    )}
                  </div>

                  {/* 2. Organizer Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Organizer Email <span className="text-red-500">*</span>
                      </label>
                      {user && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                          <Lock size={12} />
                          Locked to account
                        </span>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="email"
                        name="organizerEmail"
                        required
                        placeholder="Enter organizer email"
                        value={formData.organizerEmail}
                        readOnly={Boolean(user && user.email)}
                        onChange={handleInputChange}
                        className={`${getInputClass("organizerEmail")} ${
                          user && user.email
                            ? "bg-slate-100/90 text-slate-600 cursor-not-allowed pr-9 border-slate-200"
                            : ""
                        }`}
                      />
                      {user && user.email && (
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                          <Lock size={15} />
                        </div>
                      )}
                    </div>

                    {getFieldError("organizerEmail") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {getFieldError("organizerEmail")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* 3. City */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      City <span className="text-red-500">*</span>
                    </label>

                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={getInputClass("city")}
                    >
                      <option value="" disabled>
                        Select City
                      </option>

                      {INDIAN_CITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    {getFieldError("city") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {getFieldError("city")}
                      </p>
                    )}
                  </div>

                  {/* 4. Organiser Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Organiser Name <span className="text-red-500">*</span>
                      </label>
                      {user && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          Company / Brand name
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      name="organiserName"
                      required
                      placeholder="Enter organiser name or company"
                      value={formData.organiserName}
                      onChange={handleInputChange}
                      className={getInputClass("organiserName")}
                    />

                    {getFieldError("organiserName") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {getFieldError("organiserName")}
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. Event Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Event Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="eventName"
                    required
                    placeholder="e.g. Grand Festive Exhibition 2026"
                    value={formData.eventName}
                    onChange={handleInputChange}
                    className={getInputClass("eventName")}
                  />

                  {getFieldError("eventName") && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {getFieldError("eventName")}
                    </p>
                  )}
                </div>

                {/* 5. Event Venue */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Event Venue <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="eventVenue"
                    required
                    placeholder="Area name / landmark according to map"
                    value={formData.eventVenue}
                    onChange={handleInputChange}
                    className={getInputClass("eventVenue")}
                  />

                  {getFieldError("eventVenue") && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {getFieldError("eventVenue")}
                    </p>
                  )}
                </div>

                {/* 6. Select Venue Type */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Venue Type <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="venueType"
                    value={formData.venueType}
                    onChange={handleInputChange}
                    className={getInputClass("venueType")}
                  >
                    <option value="" disabled>
                      Select Venue Type
                    </option>

                    {VENUE_TYPES.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>

                  {getFieldError("venueType") && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {getFieldError("venueType")}
                    </p>
                  )}
                </div>

                {/* 7. Event Type */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-700">
                    Event Type <span className="text-red-500">*</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-6">
                    {["Indoor", "Outdoor", "Both"].map((type) => (
                      <label
                        key={type}
                        className="flex cursor-pointer items-center gap-2"
                      >
                        <input
                          type="radio"
                          name="eventType"
                          value={type}
                          checked={formData.eventType === type}
                          onChange={handleInputChange}
                          className="h-4 w-4 accent-orange-600"
                        />

                        <span className="text-sm font-medium text-slate-700">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>

                  {getFieldError("eventType") && (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {getFieldError("eventType")}
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION 2: DATE & DURATION */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-orange-100 pb-2">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-orange-600">
                    2. Schedule & Duration
                  </h3>

                  {/* Dynamic Event Duration */}
                  <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                    Event Duration: {eventDays}{" "}
                    {eventDays === 1 ? "Day" : "Days"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* 8. Starting Date & Time */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Starting Date & Time <span className="text-red-500">*</span>
                    </label>

                    <DateTimePicker
                      name="startingDate"
                      value={formData.startingDate}
                      onChange={(val) =>
                        handleInputChange({
                          target: { name: "startingDate", value: val },
                        })
                      }
                      min={todayDate}
                      defaultTime="10:00"
                      hasError={hasFieldError("startingDate")}
                      placeholder="Select starting date & time"
                    />

                    {getFieldError("startingDate") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {getFieldError("startingDate")}
                      </p>
                    )}
                  </div>

                  {/* 9. Ending Date & Time */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                      Ending Date & Time <span className="text-red-500">*</span>
                    </label>

                    <DateTimePicker
                      name="endingDate"
                      value={formData.endingDate}
                      onChange={(val) =>
                        handleInputChange({
                          target: { name: "endingDate", value: val },
                        })
                      }
                      min={formData.startingDate || todayDate}
                      defaultTime="19:00"
                      hasError={hasFieldError("endingDate")}
                      placeholder="Select ending date & time"
                    />

                    {getFieldError("endingDate") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {getFieldError("endingDate")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: STALL SPECIFICATIONS */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold text-orange-600 tracking-wider uppercase border-b border-orange-100 pb-2">
                  3. Stall Inventory & Pricing
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* 10. Total Stall */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Total Stalls <span className="text-red-500">*</span>
                    </label>

                    <input
                      min="0"
                      type="number"
                      name="totalStalls"
                      required
                      placeholder="Total number of stalls"
                      value={formData.totalStalls}
                      onChange={handleInputChange}
                      className={getInputClass("totalStalls", "rounded-xl")}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                    />

                    {getFieldError("totalStalls") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {getFieldError("totalStalls")}
                      </p>
                    )}
                  </div>

                  {/* 11. Available Stall */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Available Stalls <span className="text-red-500">*</span>
                    </label>

                    <input
                      min="0"
                      max={formData.totalStalls || undefined}
                      type="number"
                      name="availableStalls"
                      required
                      placeholder="Stalls currently available"
                      value={formData.availableStalls}
                      onChange={handleInputChange}
                      className={getInputClass("availableStalls", "rounded-xl")}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                    />

                    {getFieldError("availableStalls") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {getFieldError("availableStalls")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Nested stall validation errors are passed down from CreateEvent */}
                <StallDetailsManager
                  stallSetup={stallSetup}
                  setStallSetup={setStallSetup}
                  eventDays={eventDays}
                  validationErrors={validationErrors}
                  onStallSetupChange={handleStallSetupChange}
                />
              </div>

              {/* SECTION 4: CATEGORIES & FACILITIES */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold text-orange-600 tracking-wider uppercase border-b border-orange-100 pb-2">
                  4. Categories & Amenities
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* 14. Stall Category Trigger */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Stall Category <span className="text-red-500">*</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className={`w-full text-left rounded-xl px-4 py-3 text-sm flex justify-between items-center transition border ${
                        hasFieldError("categories")
                          ? "border-red-400 bg-red-50 hover:bg-red-50"
                          : "border-gray-300 bg-gray-50 hover:bg-orange-50/50 hover:border-orange-400"
                      }`}
                    >
                      <span
                        className={
                          selectedCategories.length
                            ? "font-semibold text-gray-900"
                            : "text-gray-400"
                        }
                      >
                        {selectedCategories.length
                          ? `${selectedCategories.length} Categories Selected`
                          : "Click to select stall categories..."}
                      </span>

                      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md">
                        Select ➔
                      </span>
                    </button>

                    {/* Render Selected Badges */}
                    {selectedCategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(showAllCategories
                          ? selectedCategories
                          : selectedCategories.slice(0, 5)
                        ).map((cat) => (
                          <span
                            key={cat}
                            className="bg-orange-100 text-orange-800 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          >
                            {cat}
                          </span>
                        ))}

                        {/* Show More */}
                        {selectedCategories.length > 5 &&
                          !showAllCategories && (
                            <button
                              type="button"
                              onClick={() => setShowAllCategories(true)}
                              className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2 py-0.5 rounded-full hover:bg-gray-200 hover:text-gray-700 transition"
                            >
                              +{selectedCategories.length - 5} more
                            </button>
                          )}

                        {/* Show Less */}
                        {selectedCategories.length > 5 && showAllCategories && (
                          <button
                            type="button"
                            onClick={() => setShowAllCategories(false)}
                            className="bg-gray-100 text-gray-600 text-[11px] font-bold px-2 py-0.5 rounded-full hover:bg-gray-200 hover:text-gray-700 transition"
                          >
                            Show Less
                          </button>
                        )}
                      </div>
                    )}

                    {getFieldError("categories") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {getFieldError("categories")}
                      </p>
                    )}
                  </div>

                  {/* 15. Facilities Trigger */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Facilities <span className="text-red-500">*</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsFacilityModalOpen(true)}
                      className={`w-full text-left rounded-xl px-4 py-3 text-sm flex justify-between items-center transition border ${
                        hasFieldError("facilities")
                          ? "border-red-400 bg-red-50 hover:bg-red-50"
                          : "border-gray-300 bg-gray-50 hover:bg-orange-50/50 hover:border-orange-400"
                      }`}
                    >
                      <span
                        className={
                          selectedFacilities.length
                            ? "font-semibold text-gray-900"
                            : "text-gray-400"
                        }
                      >
                        {selectedFacilities.length
                          ? `${selectedFacilities.length} Facilities Selected`
                          : "Click to select venue facilities..."}
                      </span>

                      <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md">
                        Select ➔
                      </span>
                    </button>

                    {/* Render Selected Badges */}
                    {selectedFacilities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {selectedFacilities.map((fac) => (
                          <span
                            key={fac}
                            className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                          >
                            {fac}
                          </span>
                        ))}
                      </div>
                    )}

                    {getFieldError("facilities") && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {getFieldError("facilities")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 5: MEDIA & ADDITIONAL DETAILS */}
              <div className="space-y-6">
                <h3 className="text-sm font-extrabold text-orange-600 tracking-wider uppercase border-b border-orange-100 pb-2">
                  5. Media & Highlights
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* 16. Event Poster */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Event Poster
                    </label>

                    <input
                      ref={posterInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePosterChange}
                      className="w-full text-xs text-gray-500 border border-gray-300 rounded-xl file:mr-4 file:py-2.5 file:px-4 file:rounded-l-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                    />

                    {posterPreview && (
                      <div className="group relative mt-2 w-fit">
                        <img
                          src={posterPreview}
                          alt="Poster preview"
                          className="h-28 object-cover rounded-lg border shadow-xs"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setPosterFile(null);
                            setPosterPreview("");

                            if (posterInputRef.current) {
                              posterInputRef.current.value = "";
                            }
                          }}
                          className="absolute right-2 top-2 hidden text-2xl leading-none text-black drop-shadow-[0_0_2px_white] group-hover:block"
                          aria-label="Remove poster image"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 17. Floor Plan */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Floor Plan
                    </label>

                    <input
                      ref={floorPlanInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFloorPlanChange}
                      className="w-full text-xs text-gray-500 border border-gray-300 rounded-xl file:mr-4 file:py-2.5 file:px-4 file:rounded-l-xl file:border-0 file:text-xs file:font-bold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 cursor-pointer"
                    />

                    {floorPlanPreview && (
                      <div className="group relative mt-2 w-fit">
                        <img
                          src={floorPlanPreview}
                          alt="Floor plan preview"
                          className="h-28 object-cover rounded-lg border shadow-xs"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            setFloorPlanFile(null);
                            setFloorPlanPreview("");

                            if (floorPlanInputRef.current) {
                              floorPlanInputRef.current.value = "";
                            }
                          }}
                          className="absolute right-2 top-2 hidden text-2xl leading-none text-black drop-shadow-[0_0_2px_white] group-hover:block"
                          aria-label="Remove floor plan image"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 18. Visitor Count */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Expected Visitor Count
                  </label>

                  <input
                    min="0"
                    type="number"
                    name="visitorCount"
                    placeholder="e.g. 5000"
                    value={formData.visitorCount}
                    onChange={handleInputChange}
                    className="w-full text-sm bg-gray-50/50 border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition"
                    onKeyDown={(e) => {
                      if (e.key === "-" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                {/* 19. More Detail */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    More Detail
                  </label>

                  <textarea
                    name="moreDetail"
                    rows={4}
                    placeholder="Enter additional event description, stall guidelines, timing..."
                    value={formData.moreDetail}
                    onChange={handleInputChange}
                    className="w-full text-sm bg-gray-50/50 border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition"
                  />
                </div>

                {/* 20. Event Highlights */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Event Highlights
                  </label>

                  <textarea
                    name="eventHighlights"
                    rows={3}
                    placeholder="Enter each highlight in new line"
                    value={formData.eventHighlights}
                    onChange={handleInputChange}
                    className="w-full text-sm bg-gray-50/50 border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* SECTION 6: TERMS & SUBMIT */}
              <div className="pt-4 border-t border-gray-200 space-y-4">
                {/* 21. Terms Acceptance text */}
                <p className="text-xs text-gray-600 text-center">
                  By clicking Submit, you are accepting our{" "}
                  <a
                    href="https://www.bookmystall.in/terms-conditions"
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-600 font-bold hover:underline"
                  >
                    Terms & Conditions
                  </a>
                </p>

                {/* 22. Submit Button */}
                <div className="text-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-10 py-3.5 bg-[#F25C05] hover:bg-orange-600 text-white font-extrabold text-base rounded-full shadow-lg hover:shadow-xl transition transform active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting Event..." : "Submit Event"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Modals */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleCategoriesSave}
        initialSelected={selectedCategories}
        hasError={hasFieldError("categories")}
        error={getFieldError("categories")}
      />

      <FacilityModal
        isOpen={isFacilityModalOpen}
        onClose={() => setIsFacilityModalOpen(false)}
        onSave={handleFacilitiesSave}
        initialSelected={selectedFacilities}
        hasError={hasFieldError("facilities")}
        error={getFieldError("facilities")}
      />

      <Footer />
    </div>
  );
}

export default CreateEvent;
