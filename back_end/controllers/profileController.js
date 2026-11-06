import Profile from "../models/profileModel.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Validate profile image.
const validateImage = (file) => {
  if (!file) {
    return "Please select an image.";
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image size cannot exceed 5 MB.";
  }

  return null;
};

// Upload image to Cloudinary.
const uploadImage = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "prativa/profiles",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        resolve(result);
      },
    );

    stream.end(file.buffer);
  });
};

// Delete image from Cloudinary.
const deleteImage = async (publicId) => {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });
  } catch (error) {
    console.error("Cloudinary image deletion error:", error);
  }
};

// CREATE PROFILE
// Only username is required. Bio and profile picture are optional.
export const createProfile = async (req, res) => {
  let uploadedImage;

  try {
    const { username, bio = "" } = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({
        success: false,
        message: "Username is required.",
      });
    }

    if (typeof bio !== "string") {
      return res.status(400).json({
        success: false,
        message: "Bio must be a valid string.",
      });
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedBio = bio.trim();

    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
      return res.status(400).json({
        success: false,
        message:
          "Username must be 3–20 characters and contain only lowercase letters, numbers, and underscores.",
      });
    }

    if (normalizedBio.length > 160) {
      return res.status(400).json({
        success: false,
        message: "Bio cannot exceed 160 characters.",
      });
    }

    // Check whether the user already has a profile.
    const existingProfile = await Profile.findOne({
      user: req.user.id,
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "You already have a profile.",
      });
    }

    // Check username availability.
    const existingUsername = await Profile.findOne({
      username: normalizedUsername,
    });

    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken.",
      });
    }

    const profileData = {
      user: req.user.id,
      username: normalizedUsername,
      bio: normalizedBio,
    };

    // Upload optional profile picture.
    if (req.file) {
      const imageError = validateImage(req.file);

      if (imageError) {
        return res.status(400).json({
          success: false,
          message: imageError,
        });
      }

      uploadedImage = await uploadImage(req.file);

      profileData.profileImage = uploadedImage.secure_url;
      profileData.imagePublicId = uploadedImage.public_id;
    }

    const profile = await Profile.create(profileData);

    return res.status(201).json({
      success: true,
      message: "Profile created successfully.",
      profile,
    });
  } catch (error) {
    // Remove uploaded image if profile creation fails.
    if (uploadedImage?.public_id) {
      await deleteImage(uploadedImage.public_id);
    }

    console.error("Create profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create profile.",
    });
  }
};

// GET LOGGED-IN USER PROFILE
export const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", "name email");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get my profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile.",
    });
  }
};

// GET ANOTHER USER'S PROFILE
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await Profile.findOne({
      user: userId,
    }).populate("user", "name");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile.",
    });
  }
};

// UPDATE PROFILE
// Username is permanent after profile creation.
// Users can update their bio and profile picture.
export const updateProfile = async (req, res) => {
  let uploadedImage;
  let oldImagePublicId;

  try {
    const { bio } = req.body;

    const profile = await Profile.findOne({
      user: req.user.id,
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Create a profile first.",
      });
    }

    // Prevent username changes.
    if (req.body.username !== undefined) {
      return res.status(403).json({
        success: false,
        message: "Username cannot be changed after profile creation.",
      });
    }

    // Update bio.
    if (bio !== undefined) {
      if (typeof bio !== "string") {
        return res.status(400).json({
          success: false,
          message: "Bio must be a valid string.",
        });
      }

      const normalizedBio = bio.trim();

      if (normalizedBio.length > 160) {
        return res.status(400).json({
          success: false,
          message: "Bio cannot exceed 160 characters.",
        });
      }

      profile.bio = normalizedBio;
    }

    // Update profile picture.
    if (req.file) {
      const imageError = validateImage(req.file);

      if (imageError) {
        return res.status(400).json({
          success: false,
          message: imageError,
        });
      }

      uploadedImage = await uploadImage(req.file);

      oldImagePublicId = profile.imagePublicId;

      profile.profileImage = uploadedImage.secure_url;
      profile.imagePublicId = uploadedImage.public_id;
    }

    await profile.save();

    // Delete old picture only after successful database update.
    if (oldImagePublicId) {
      await deleteImage(oldImagePublicId);
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile,
    });
  } catch (error) {
    // Clean up newly uploaded image if database update fails.
    if (uploadedImage?.public_id) {
      await deleteImage(uploadedImage.public_id);
    }

    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
};
