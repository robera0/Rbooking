import { motion } from "framer-motion";
import { CircleCheckBig } from "lucide-react";
import { eventService } from "@/Context/ApiEvent";
import axios, { formToJSON } from "axios";
import { useMutation } from "@tanstack/react-query";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import toast from "react-hot-toast";
import { useState } from "react";
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
const Profile = () => {
  const progress = 80;
  const { userProfile, userIsLoading, userIsError, userError } = eventService();
  const formattedForInput = userProfile?.user?.dateOfBirth
    ? userProfile.user.dateOfBirth.split("T")[0]
    : "";
  const [formData, setFormData] = useState({
    fullName: userProfile?.user?.fullName || "",
    nationality: userProfile?.user?.nationality || "",
    phone: userProfile?.user?.phone || "",
    dateOfBirth: formattedForInput || "",
    Gender: userProfile?.user?.Gender || "",
    address: userProfile?.user?.address || "",
    bio: userProfile?.user?.bio || "",
    avatarUrl: userProfile?.user?.avatarUrl || "",
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const updateUser = async () => {
    const toastId = toast.loading("updating profile...");

    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/user_profile",
        formData,
        {
          withCredentials: true,
        },
      );
      toast.success("user profile updated successful ", {
        id: toastId,
        duration: 3000,
      });
      return res.data;
    } catch (error) {
      console.log({ message: message.error });
    }
  };

  const profileMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
  return (
    <div className="mb-2 flex flex-col items-center space-y-8">
      {" "}
      {/*PROGRESS SECTION */}
      <div className="w-[92%]  h-auto  bg-[#2A2C31]  rounded-md pl-6 pt-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <h1 className="text-lg text-white font-semibold">
              Complete your profile
            </h1>
            <h1 className="text-lg text-white font-semibold mr-8">
              {progress}%
            </h1>
          </div>
          {/*PROGRESS BAR */}
          <div className="w-[95%] h-2 bg-[#202020] rounded-md overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{
                duration: 0.6,
                ease: "easeInOut",
              }}
              className="h-full bg-[#62FE8A] rounded-md"
            />
          </div>

          <p className="w-full text-[#808080] text-sm">
            Get the best out of booking by adding the remaining details!
          </p>
        </div>

        {/*VARIFICATION  */}
        <div className="flex flex-wrap  w-[95%] h-20 bg-[#191B1D] px-3 mb-8 rounded-md gap-x-6 gap-y-2">
          {/* EMAIL */}
          <div className="flex items-center space-x-2">
            <CircleCheckBig className="w-4 h-4 text-[#14AE5C]" />
            <h1 className="text-sm text-white font-semibold">Verified Email</h1>
          </div>

          {/* MOBILE NUMBER */}
          <div className="flex items-center space-x-2">
            <CircleCheckBig className="w-4 h-4 text-[#14AE5C]" />
            <h1 className="text-sm text-white font-semibold">
              Verified Mobile Number
            </h1>
          </div>
        </div>
      </div>
      {/*PERSONAL INFO */}
      <div className="flex flex-col flex-wrap w-[95%] bg-[#191B1D] px-6 pt-5 mb-8 rounded-md gap-y-4">
        <h1 className="text-2xl text-white font-semibold">
          Personal information
        </h1>
        <div className="w-full h-[0.3px] bg-gray-600" />

        {/* PROFILE VIEW */}
        <div className="space-y-2">
          <p className="w-full text-[#808080] text-sm">
            Upload your profile photo
          </p>
          <div className="flex flex-wrap items-center space-x-6">
            <div>
              <img
                src={userProfile?.user?.avatarUrl || "/Login.jpg"}
                alt="Profile"
                className="w-24 h-24 object-cover rounded-full"
              />
            </div>
            <button className="w-[96px] h-7 text-white text-sm font-semibold bg-[#FF7800] rounded-sm">
              Change
            </button>
          </div>
        </div>

        {/* PERSONAL INFO FORM (placed under profile view) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            profileMutation.mutate(formData);
          }}
          id="personalInfoForm"
          className="w-full  rounded-xl mb-12 space-y-5 "
        >
          {/* Full Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full bg-[#2a2d33] text-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={userProfile?.user?.userId?.email}
              className="w-full bg-[#2a2d33] text-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-[#2a2d33] text-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Nationality */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Nationality <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nationality"
              required
              value={formData.nationality}
              onChange={handleChange}
              className="w-full bg-[#2a2d33] text-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateOfBirth"
              required
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full bg-[#2a2d33] text-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Select Gender <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-6 text-gray-300">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="Gender"
                  value="male"
                  checked={formData.Gender === "male"}
                  onChange={handleChange}
                  className="accent-orange-500"
                />
                Male
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="Gender"
                  value="female"
                  checked={formData.Gender === "female"}
                  onChange={handleChange}
                  className="accent-orange-500"
                />
                Female
              </label>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Address</label>
            <textarea
              name="address"
              rows={2}
              value={formData.address}
              onChange={handleChange}
              className="w-full bg-[#2a2d33] text-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              onSubmit={(e) => {
                e.preventDefault();
                profileMutation.mutate(formData);
              }}
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
      {/*UPDATE EMAIL */}
      <div className="flex flex-col flex-wrap w-[95%] bg-[#191B1D] px-6 pt-5 mb-8 rounded-md gap-y-4">
        <h1 className="text-2xl text-white font-semibold">Update Email</h1>
        <p className="w-full text-[#808080] text-sm">
          your current email address is{" "}
          <span className="text-orange-500">
            {userProfile?.user?.userId?.email}
          </span>
        </p>
        <div className="w-full h-[0.3px] bg-gray-600" />

        <form
          id="personalInfoForm"
          className="w-full  rounded-xl mb-12 space-y-5 "
        >
          {/* NEW EMAIL  */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Enter new Email<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Enter new email"
              required
              className="w-full bg-[#2a2d33] text-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
      {/*UPDATE PASSWORD */}
      <div className="flex flex-col flex-wrap w-[95%] bg-[#191B1D] px-6 pt-5 mb-8 rounded-md gap-y-4">
        <h1 className="text-2xl text-white font-semibold">Update Password</h1>
        <p className="w-full text-[#808080] text-sm">
          your current password address is{" "}
          <span className="text-orange-500">example123</span>
        </p>
        <div className="w-full h-[0.3px] bg-gray-600" />

        <form
          id="personalInfoForm"
          className="w-full  rounded-xl mb-12 space-y-5 "
        >
          {/* CURRENT PASSWORD  */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Current password<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Enter current password"
              required
              className="w-full bg-[#2a2d33] text-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/*NEW PASSWORD */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              New password<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="Enter new password"
              required
              className="w-full bg-[#2a2d33] text-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/*CONFIRM PASSWORD */}

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Confirm password<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="confirm new  password"
              required
              className="w-full bg-[#2a2d33] text-white rounded-md px-4 py-3 outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-md font-medium"
            >
              Change password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
