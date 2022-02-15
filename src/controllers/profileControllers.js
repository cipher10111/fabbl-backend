import cloudinary from "cloudinary";
import User from "../models/userModel.js";
import ErrorMessage from "../utils/errorMessage.js";
import keys from "../config/keys.js";
// @route     GET  /user/profile/:id
// desc         get current user profile
// @access  private

export const currentUserProfile = async (req, res) => {
  const userId = req.params.id;
  try {
    const profile = await User.findById(userId).select("-password");
    if (!profile) {
      return res
        .status(400)
        .json({ success: false, message: "there is no profile for user" });
    }
    res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "there is no profile for user" });
  }
};

// @route     POST  /user/profile/Personal
// desc          update user profile preferences
// @access  private

export const updateSettings = async (req, res) => {
  const userId = req.params.id;
  const {
    theme,
    username,
    genderPref,
    bio,
    age,
    location,
    relationshipStatusPref,
    hobbies,
    autoDelete,
  } = req.body;

  try {
    const profileData = await User.findById(userId);
    profileData.displayName.status = username;
    profileData.gender.status = genderPref;
    profileData.headline.status = bio;
    profileData.dob.status = age;
    profileData.location.status = location;
    profileData.relationshipStatus.status = relationshipStatusPref;
    profileData.hobby.status = hobbies;
    profileData.settings.theme = theme;
    profileData.settings.autoDelete = autoDelete;
    const profile = await User.findByIdAndUpdate(
      userId,
      { $set: profileData },
      { new: true }
    ).select("-password");
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "there is no profile for user" });
  }
};

// @route     POST  /user/profile/Personal/:id
// desc          update user profile Personal-data
// @access  private

export const updatePersonalData = async (req, res) => {
  const userId = req.params.id;
  const {
    usernameData,
    genderData,
    bioData,
    ageData,
    locationData,
    relationshipStatusData,
    hobbiesData,
  } = req.body;

  try {
    const profileData = {
      "profileData.displayName.value": usernameData,
      "profileData.gender.value": genderData,
      "profileData.headline.value": bioData,
      "profileData.dob.value": ageData,
      "profileData.location.value": locationData,
      "profileData.relationshipStatus.value": relationshipStatusData,
      "profileData.hobby.value": hobbiesData,
    };

    const profile = await User.findByIdAndUpdate(
      userId,
      { $set: profileData },
      { new: true }
    ).select("-password");
    return res.status(200).json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "there is no profile for user" });
  }
};

// @route     post  /user/upload/image/:id
// desc         upload user image
// @access  private

export const imageUpload = async (req, res) => {
  cloudinary.config({
    cloud_name: keys.cloudinary.cloud_name,
    api_key: keys.cloudinary.api_key,
    api_secret: keys.cloudinary.api_secret,
  });
  const userId = req.params.id;
  const imageFile = req.files.data;
  console.log(req.files.data);
  try {
    const uploadResponse = await cloudinary.v2.uploader.upload(
      imageFile.tempFilePath,
      {
        public_id: userId,
        folder: "fabbl",
      }
    );
    console.log(uploadResponse);
    const fileExt = imageFile.name.split(".")[1];
    const avatar = `${keys.cloudinary.PROFILE_URL}/${userId}.${fileExt}`;

    const profile = await User.findByIdAndUpdate(
      userId,
      { $set: { "avatar.value": avatar } },
      { new: true }
    ).select("avatar");
    return res.status(200).json({ success: true, avatar: profile.avatar });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "unable to upload" });
  }
};
