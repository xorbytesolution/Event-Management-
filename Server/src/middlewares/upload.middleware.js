import multer from "multer";
import ApiError from "../utils/ApiError.js";

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  if (file.mimetype?.startsWith("image/")) {
    cb(null, true);
    return;
  }

  cb(
    new ApiError(
      400,
      "Only image files are allowed for poster and floor plan",
    ),
  );
};

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "posterImage", maxCount: 1 },
  { name: "floorPlanImage", maxCount: 1 },
]);

export const eventMediaUpload = (req, res, next) => {
  upload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(new ApiError(400, "Image must be 5MB or smaller"));
        return;
      }

      next(new ApiError(400, error.message));
      return;
    }

    if (error) {
      next(error);
      return;
    }

    next();
  });
};
