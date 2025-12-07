import { useState } from "react";
import { useService } from "../../Context/ServiceContext";
import { Toggle } from "../../components/Reusable";
import { eventService } from "../../Context/ApiEvent";
import { Phone, Instagram, MapPin, Mail, Globe } from "lucide-react";
import Loader from "../../components/Loader";

export const Info = ({ header, icon, touched, infos, action }) => {
  return (
    <div className="border-b">
      <div className="flex gap-3 ">
        {/*icon */}
        <div className="w-12 flex text-[#168FF4] justify-center items-center">
          {icon}
        </div>
        {/*infos */}
        <div className="flex-1 space-y-2 ">
          <div>
            <h1 className="text-[#8C8484] text-light pt-2">{header}</h1>
          </div>
          <div className="mb-4">
            <input
              value={infos}
              onClick={touched}
              onChange={action}
              className="text-white w-60 h-full outline-none bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const [businessname, setBusinessname] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [cover, setCover] = useState(null);
  const [logo, setLogo] = useState(null);
  const [phone, setPhone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [profileView, setProfileView] = useState(false);
  const { businesses, BusinessIsLoading, BusinessError } = eventService();
  const [toggleOn, setToggleOn] = useState(true);
  const [loader, setLoader] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [touched, setTouched] = useState({
    businessName: false,
    businessDescription: false,
    businessPhone: false,
    businessInstagram: false,
    businessAddress: false,
    businessEmail: false,
    businessWebsite: false,
  });

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setlogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const business = businesses?.[0];

  const phonevalue =
    business?.info?.find((i) => i.info_type === "phone")?.value || "";
  const instavalue =
    business?.info?.find((i) => i.info_type === "instagram")?.value || "";
  const emailvalue =
    business?.info?.find((i) => i.info_type === "email")?.value || "";
  const addressvalue =
    business?.info?.find((i) => i.info_type === "address")?.value || "";
  const websitevalue = business?.website || "";

  // UPDATE BUSINESS INFO
  const updateProfile = async () => {
    try {
      const formData = new FormData();
      formData.append("name", businessname || "");
      formData.append("description", businessDescription || "");
      formData.append("phone", phone || phonevalue);
      formData.append("instagram", instagram || instavalue);
      formData.append("location", location || addressvalue);
      formData.append("email", email || emailvalue);
      formData.append("website", website || websitevalue);

      if (cover) formData.append("cover", cover);
      if (logo) formData.append("logo", logo);

      const res = await fetch("http://localhost:5000/api/profile", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      console.log("Updated profile:", data);
      return data;
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  return (
    <div className="scroll-hidden h-screen overflow-auto">
      {loader ? (
        <div className="flex mt-60 justify-center items-center">
          <Loader />
        </div>
      ) : (
        <div className="space-y-8">
          <h1 className="text-xl text-white pt-8 font-semi-bold text-center">
            Business Profile
          </h1>
          <div className="pl-4 space-y-4 w-[90%]">
            <div className="flex h-12 bg-[#343434] hover:bg-[#323232] cursor-pointer rounded-sm">
              <Toggle
                toggleOn={toggleOn}
                toggle={() => setToggleOn((prev) => !prev)}
                action={() => setProfielView((prev) => !prev)}
                name="Show Business Profile"
              />
            </div>
            <p className="text-[#8C8484]">
              Display your business information and provide customers with
              additional contact options. Also, business information can be used
              in email notifications.
            </p>
          </div>

          {BusinessIsLoading && <div>Loading business Profile...</div>}
          {BusinessError && <div>Error: {BusinessError.message}</div>}

          <div className="w-[90%] ml-4 bg-[#343434] rounded-md space-y-4 p-4">
            {/* Business Name */}
            <div>
              <label className="text-lg font-light text-[#645D5D]">
                Business Name
              </label>
              <textarea
                value={
                  touched.businessName ? businessname : business?.name || ""
                }
                onClick={() =>
                  setTouched((prev) => ({ ...prev, businessName: true }))
                }
                onChange={(e) => {
                  setBusinessname(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder="Enter business name..."
                className="border-b border-[#2A2A2A] w-full rounded-md bg-transparent outline-none text-white placeholder-gray-500 resize-none overflow-hidden"
              />
            </div>

            {/* Business Description */}
            <div>
              <label className="text-lg font-light text-[#645D5D]">
                Business Description
              </label>
              <textarea
                value={
                  touched.businessDescription
                    ? businessDescription
                    : business?.description || ""
                }
                onClick={() =>
                  setTouched((prev) => ({ ...prev, businessDescription: true }))
                }
                onChange={(e) => {
                  setBusinessDescription(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                placeholder="Enter business description..."
                className="border-b border-[#2A2A2A] w-full rounded-md bg-transparent outline-none text-white placeholder-gray-500 resize-none overflow-hidden"
              />
            </div>

            {/* Cover Upload */}
            <div className="relative flex h-16 w-full justify-between items-center pr-4 border-b border-[#2A2A2A]">
              <label className="text-md pl-4 text-white flex justify-center items-center font-semibold cursor-pointer">
                Cover
                <input
                  name="cover"
                  onChange={handleCoverChange}
                  type="file"
                  className="hidden"
                  accept="image/*"
                />
              </label>
              <div className="w-12 h-12 mr-2 rounded-md bg-gray-400 bg-center bg-cover overflow-hidden">
                {coverPreview || business?.cover ? (
                  <img
                    src={coverPreview || business.cover || "/defaultAvater.jpg"}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    No cover
                  </div>
                )}
              </div>
            </div>

            {/* Logo Upload */}
            <div className="relative flex h-16 w-full justify-between items-center pr-4 border-b border-[#2A2A2A]">
              <label className="text-md pl-4 text-white flex justify-center items-center font-semibold cursor-pointer">
                Logo
                <input
                  name="logo"
                  onChange={handleLogoChange}
                  type="file"
                  className="hidden"
                  accept="image/*"
                />
              </label>
              <div className="w-12 h-12 mr-2 rounded-md bg-gray-400 bg-center bg-cover overflow-hidden">
                {logoPreview || business?.logo ? (
                  <img
                    src={logoPreview || business.logo || "/defaultAvater.jpg"}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    No logo
                  </div>
                )}
              </div>
            </div>

            {/* Social Info */}
            <div className="w-full h-full bg-[#343434] rounded-md space-y-2 p-2">
              <Info
                header="Phone"
                icon={<Phone />}
                touched={() =>
                  setTouched((prev) => ({ ...prev, businessPhone: true }))
                }
                infos={touched.businessPhone ? phone : phonevalue}
                action={(e) => setphone(e.target.value)}
              />
              <Info
                header="Instagram"
                icon={<Instagram />}
                touched={() =>
                  setTouched((prev) => ({ ...prev, businessInstagram: true }))
                }
                infos={touched.businessInstagram ? instagram : instavalue}
                action={(e) => setInstagram(e.target.value)}
              />
              <Info
                header="Address"
                icon={<MapPin />}
                touched={() =>
                  setTouched((prev) => ({ ...prev, businessAddress: true }))
                }
                infos={touched.businessAddress ? location : addressvalue}
                action={(e) => setlocation(e.target.value)}
              />
              <Info
                header="Email"
                icon={<Mail />}
                touched={() =>
                  setTouched((prev) => ({ ...prev, businessEmail: true }))
                }
                infos={touched.businessEmail ? email : emailvalue}
                action={(e) => setEmail(e.target.value)}
              />
              <Info
                header="Website"
                icon={<Globe />}
                touched={() =>
                  setTouched((prev) => ({ ...prev, businessWebsite: true }))
                }
                infos={touched.businessWebsite ? website : websitevalue}
                action={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex mb-12 justify-center items-center">
            <button
              onClick={async () => {
                setLoader(true);
                setTimeout(() => setLoader(false), 2000);
                await updateProfile();
              }}
              className="w-56 h-12 text-center text-white font-semibold bg-[#343434] cursor-pointer rounded hover:bg-[#404040] disabled:opacity-50"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
