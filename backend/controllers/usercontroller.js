import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }
    res.status(200).json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message || "Internal Server Error!" });
  }
};

export const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      res.status(400).json({ error: "You can't follow/unfollow yourself" });
    }
    if (!userToModify || !currentUser) {
      es.status(400).json({ error: "User not found!" });
    }

    const isFollowing = currentUser.following.includes(userToModify._id);
    if (isFollowing) {
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      res.status(200).json({ message: "User unfollowed successfully!" });
    } else {
      // Follow the User
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      const newNotification = new Notification({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });
      await newNotification.save();
      res.status(200).json({ message: "User followed successfully!" });
    }
  } catch (error) {
    console.log(error.message);
    res
      .status(500)
      .json({ message: error.message || "Internal Server Error!" });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    // const followedByMe = await User.findById(userId).select("following");
    // const usersExceptMe = await User.aggregate([
    //   {
    //     $match: {
    //       _id: { $ne: userId },
    //     },
    //   },
    //   { $sample: { size: 10 } },
    // ]);

    // // filtering the user no followed by me
    // const filteredUsers = usersExceptMe.filter(
    //   (users) => !followedByMe.following.includes(users._id)
    // );
    // const suggestedUsers = filteredUsers.slice(0, 4);
    // suggestedUsers.forEach((users) => (users.password = null));

    // Or
    const currentUser = await User.findById(userId).select("following");

    const suggestedUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
          _id: { $nin: currentUser.following || userId },
        },
      },
      {
        $addFields: {
          password: null,
        },
      },
      {
        $sample: { size: 4 },
      },
    ]);

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message || "Internal Server Error!" });
  }
};

export const updateUser = async (req, res) => {
  const { fullname, email, username, currentPassword, newPassword, bio, link } =
    req.body;

  let { profileImg, coverImg } = req.body;

  const requiredFields = [
    "fullname",
    "email",
    "username",
    "currentPassword",
    "newPassword",
    "bio",
    "link",
    "profileImg",
    "coverImg",
  ];
const extraFields = Object.keys(req.body).some(field => !requiredFields.includes(field));

if (extraFields) {
    return res.status(400).json({ error: "Invalid keys provided" });
}

  const userId = req.user._id;
  console.log("User ID:", userId);
  try {
    let currentUser = await User.findOne({ _id: userId });
    if (!currentUser) {
      return res.status(404).json({ error: "User not found!" });
    }
    console.log("Found user:", currentUser);

    //Updating Password
    if (
      (!currentPassword && newPassword) ||
      (!newPassword && currentPassword)
    ) {
      return res
        .status(400)
        .json({ error: "Current and new password are required!" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(
        currentPassword,
        currentUser.password
      );
      if (!isMatch)
        return res.status(400).json({ error: "Invalid current password!" });
      if (newPassword.length < 6)
        return res
          .status(400)
          .json({ error: "New password must be more than 6 characters." });

      const salt = await bcrypt.genSalt(10);
      currentUser.password = await bcrypt.hash(newPassword, salt);
    }
    // Updating Image
    if (profileImg) {
      // Delete the existing image on cloudinary
      if (currentUser.profileImg) {
        await cloudinary.uploader.destroy(
          currentUser.profileImg?.split("/").pop()?.split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }
    if (coverImg) {
      if (currentUser.coverImg) {
        await cloudinary.uploader.destroy(
          currentUser.coverImg?.split("/").pop()?.split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    currentUser.fullname = fullname || currentUser.fullname;
    currentUser.email = email || currentUser.email;
    currentUser.username = username || currentUser.username;
    currentUser.bio = bio || currentUser.bio;
    currentUser.link = link || currentUser.link;
    currentUser.profileImg = profileImg || currentUser.profileImg;
    currentUser.coverImg = coverImg || currentUser.coverImg;

    currentUser = await currentUser.save();
    currentUser.password = null;
    console.log(currentUser);
    res
      .status(200)
      .json({ message: "Profile Updated Successfully!", data: currentUser });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message || "Internal Server Error!" });
  }
};
