import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { BusinessCards } from "./Cards";
import { Plus } from "lucide-react";
import { Listbox } from "@headlessui/react";
import {
  CloudUpload,
  Image,
  Check,
  UserRoundCog,
  ChevronDown,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

// Fix marker icons (IMPORTANT)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useMutation } from "@tanstack/react-query";
import { add_salon, buildFormData } from "./api/salon.api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>
        📍 Selected Location <br />
        Lat: {position[0]} <br />
        Lng: {position[1]}
      </Popup>
    </Marker>
  ) : null;
};

const AddSalon = () => {
  const [position, setPosition] = useState(null);

  const Maps = () => {
    return (
      <div className="w-full h-full">
        {/* Map */}
        <MapContainer
          center={[9.03, 38.74]} // Addis Ababa default
          zoom={13}
          scrollWheelZoom
          className="h-full w-full rounded-lg shadow-md"
        >
          {/* Tiles */}
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Click Handler + Marker */}
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
    );
  };
  const options = [
    { id: 1, label: "Recently", value: "recently" },
    { id: 2, label: "Most Popular", value: "popular" },
    { id: 3, label: "Top Rated", value: "top" },
  ];
  const navigate = useNavigate();

  const pageVariants = {
    initial: { opacity: 0, x: 20, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -20, scale: 0.98 },
  };

  const pageTransition = {
    duration: 0.7,
    ease: [0.25, 0.1, 0.25, 1],
  };
  const PageWrapper = ({ children }) => (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );

  const [portfolioImage, setPortfolioImage] = useState("");
  const [serviceImage, setServiceImage] = useState("");
  const [selected, setSelected] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    bio: "",
    portfolio: "",
    coordinates: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "latitude") {
      const lng = formData.coordinates[1] || "";
      setFormData((prev) => ({ ...prev, coordinates: [value, lng] }));
      return;
    }
    if (name === "longitude") {
      const lat = formData.coordinates[0] || "";
      setFormData((prev) => ({ ...prev, coordinates: [lat, value] }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handlePortfolioImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPortfolioImage(objectUrl);
    setFormData((prev) => ({ ...prev, portfolio: file }));
  };
  const handleServiceImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setServiceImage(objectUrl);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file) setPortfolioImage(file);
  };
  const handleDragOver = (e) => e.preventDefault();

  const addSalonMutation = useMutation({
    mutationFn: add_salon,
  });

  const handleSubmit = () => {
    const fd = buildFormData();
    addSalonMutation.mutate(fd);
  };

  return (
    <div className="">
      <div className="w-[97%] space-y-8">
        <div className="flex justify-between">
          <h1 className="text-3xl font-semibold"> Add new Salon </h1>
          <button
            onClick={() => navigate("/salon")}
            className="w-42 h-12 px-2 py-3 text-[#A61866] font-semibold bg-white  outline-1 outline-offset-0 border border-[#A61866] rounded-md cursor-pointer  hover:text-white hover:bg-[#A61866] transition-all ease-in duration-300 space-x-4"
          >
            Back to List
          </button>
        </div>
        <div className="mb-8 space-y-12">
          {/* Top the Salon information */}

          <div className="flex flex-wrap w-full space-x-8 ">
            {/*the left side  */}
            <div className=" w-[72%] h-[1170px] p-8  rounded-xl shadow-md space-y-6">
              <div className="space-y-2">
                <h1 className="text-2xl font-semibold">Salon information</h1>
                <p className="text-gray-500 text-sm">create new salon</p>
              </div>
              {/*title  */}
              <div className="space-y-2">
                <h1 className="font-medium text-xl">Salon title</h1>
                <input
                  className="w-full h-[40px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-lg"
                  type="text"
                  placeholder="Enter a short title"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              {/*Email/Phone */}

              <div className="relative space-y-2">
                <h1 className="font-medium">Email /Phone </h1>
                <input
                  className=" w-full h-[40px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-lg"
                  type="text"
                  placeholder="Enter email or phone "
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />

                <button
                  onClick={() => navigate("/salon")}
                  className="absolute right-2 top-9.5 w-18 h-7  px-2 text-xs  text-white bg-[#A61866]    outline-1 outline-offset-0 border border-[#A61866] rounded-md cursor-pointer hover:bg-white  hover:text-[#A61866]  transition-all ease-in duration-300 space-x-4"
                >
                  Get code
                </button>
              </div>

              {/*Address  */}
              <div className="space-y-2">
                <h1 className="font-medium">Address </h1>
                <input
                  className="w-full h-[40px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-lg"
                  type="text"
                  placeholder="Enter valid address that matches your registered region "
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              {/*About/Bio  */}
              <div className=" w-[98%] space-y-2">
                <h1 className="font-medium">About/Bio </h1>
                <input
                  className="w-full h-[95px] pb-30 pl-4  pt-6 border border-gray-400 bg-gray-100 outline-none  rounded-lg"
                  type="text"
                  placeholder="Enter notification message here"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                />
                <p className="text-md text-gray-400">
                  {" "}
                  maximum 1000 characters
                </p>
              </div>

              {/*image upload */}

              <div className="w-[98%] space-y-2">
                <div className="flex justify-between">
                  <h1 className="font-medium">Upload portfolio photos </h1>

                  {portfolioImage && (
                    <button
                      onClick={() => setPortfolioImage(null)}
                      className="text-red-600 font-bold"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div
                  className="w-full h-[150px] pl- flex flex-col justify-center items-center 
                        border border-gray-400 bg-gray-100 outline-none rounded-lg relative overflow-hidden"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {portfolioImage ? (
                    <>
                      <img
                        src={portfolioImage}
                        className=" w-full h-full object-cover  object-center "
                        alt=""
                      />
                    </>
                  ) : (
                    <label
                      htmlFor="fileUploadPortfolio"
                      className="flex flex-col items-center justify-center p-4 cursor-pointer"
                    >
                      <CloudUpload
                        strokeWidth={2}
                        className="w-10 h-10 mb-2 text-[#A61866]"
                      />
                      <p className="text-sm font-bold text-gray-600 mb-2">
                        <span className="text-[#A61866]">Click to upload</span>{" "}
                        or <span className="text-gray-600">Drag and drop</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Supported: JPEG, PNG, WebP (5MB max)
                      </p>
                      <input
                        id="fileUploadPortfolio"
                        type="file"
                        accept="image/*"
                        onChange={handlePortfolioImage}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="font-medium">Map Link</h1>
                <div className="flex justify-between space-x-4">
                  <input
                    className="w-[50%] h-[45px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-lg"
                    type="text"
                    placeholder="Latitude"
                    name="latitude"
                    value={
                      formData.coordinates && formData.coordinates[0]
                        ? formData.coordinates[0]
                        : ""
                    }
                    onChange={handleChange}
                  />

                  <input
                    className="w-[50%] h-[45px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-lg"
                    type="text"
                    placeholder="Longitude"
                    name="longitude"
                    value={
                      formData.coordinates && formData.coordinates[1]
                        ? formData.coordinates[1]
                        : ""
                    }
                    onChange={handleChange}
                  />
                </div>
                {/*Map */}
                <div
                  className="w-full h-[200px] pl- flex flex-col justify-center items-center 
                        border border-gray-400 outline-none rounded-lg "
                >
                  <Maps />
                </div>
              </div>
            </div>

            {/*the right side  */}

            <div className="flex-1 rounded-xl p-6 space-y-12 shadow-xl">
              <div className="space-y-2">
                <h1 className="font-semibold text-2xl">Service List</h1>
                <p className="text-gray-500">
                  Add services your salon will give
                </p>
              </div>

              {/*service lists */}
              <div className="space-y-3">
                <div className="w-full flex items-center justify-between">
                  {/* Left side */}
                  <div className="flex items-center gap-8">
                    <Image />
                    <h1 className="font-medium">Waxing</h1>
                  </div>

                  {/* Right side */}
                  <span className="font-medium">100 ETB</span>
                </div>
                <div className="w-full flex items-center justify-between">
                  {/* Left side */}
                  <div className="flex items-center gap-8">
                    <Image />
                    <h1 className="font-medium">Waxing</h1>
                  </div>

                  {/* Right side */}
                  <span className="font-medium">100 ETB</span>
                </div>
                <div className="w-full flex items-center justify-between">
                  {/* Left side */}
                  <div className="flex items-center gap-8">
                    <Image />
                    <h1 className="font-medium">Waxing</h1>
                  </div>

                  {/* Right side */}
                  <span className="font-medium">100 ETB</span>
                </div>
                <div className="w-full flex items-center justify-between">
                  {/* Left side */}
                  <div className="flex items-center gap-8">
                    <Image />
                    <h1 className="font-medium">Waxing</h1>
                  </div>

                  {/* Right side */}
                  <span className="font-medium">100 ETB</span>
                </div>
              </div>

              <div className="border border-gray-400 rounded-md p-4 space-y-4 shadow-sm">
                <div className="flex justify-between text-sm space-x-4">
                  <input
                    className="w-[80%] h-[40px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-lg"
                    type="text"
                    placeholder="Service name"
                  />

                  <input
                    className="w-[40%] h-[40px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-xl"
                    type="text"
                    placeholder="price"
                  />
                </div>

                <div className="w-full text-sm">
                  <Listbox value={selected} onChange={setSelected}>
                    {({ open }) => (
                      <div className="relative w-full">
                        {/* Button */}
                        <Listbox.Button
                          className="
            relative w-full h-10
            cursor-pointer
            rounded-md
            bg-gray-100
            border border-gray-600
            px-3 text-sm
            flex items-center justify-between
            outline-none
          "
                        >
                          <span className="text-black">
                            {selected ? selected.label : "Choose Category"}
                          </span>

                          <ChevronDown
                            size={16}
                            className={`text-black transition-transform ${
                              open ? "rotate-180" : ""
                            }`}
                          />
                        </Listbox.Button>

                        {/* Animated Options */}
                        <AnimatePresence>
                          {open && (
                            <Listbox.Options
                              as={motion.div}
                              static
                              initial={{ opacity: 0, y: -10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.95 }}
                              transition={{
                                duration: 0.25,
                                ease: [0.25, 0.1, 0.25, 1],
                              }}
                              className="
                absolute z-10 mt-1 w-full
                rounded-md
                bg-gray-100
                border border-gray-600
                shadow-xl
                focus:outline-none
                text-black
              "
                            >
                              {options.map((option) => (
                                <Listbox.Option
                                  key={option.id}
                                  value={option}
                                  className={({ active }) =>
                                    `
                      cursor-pointer px-3 h-10
                      flex items-center justify-between
                      text-sm
                      ${active ? "bg-[#A61866] text-white" : "text-black"}
                    `
                                  }
                                >
                                  {({ selected }) => (
                                    <>
                                      <span>{option.label}</span>
                                      {selected && <Check size={14} />}
                                    </>
                                  )}
                                </Listbox.Option>
                              ))}
                            </Listbox.Options>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </Listbox>
                </div>

                <div className="w-[98%] space-y-2">
                  <div className="flex justify-between">
                    {serviceImage && (
                      <button
                        onClick={() => setServiceImage(null)}
                        className="text-red-600 text-sm font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div
                    className="w-full h-[60px] pl- flex flex-col justify-center items-center 
                        border border-gray-400 bg-gray-100 outline-none rounded-lg relative overflow-hidden"
                  >
                    {serviceImage ? (
                      <>
                        <img
                          src={serviceImage}
                          className=" w-full h-full object-cover  object-center "
                          alt=""
                        />
                      </>
                    ) : (
                      <label
                        htmlFor="fileUploadService"
                        className="flex  items-center justify-center p-4 cursor-pointer space-x-4"
                      >
                        <p className="text-sm font-bold text-gray-600 mb-2">
                          <span className="text-[#A61866]">Upload</span> or{" "}
                          <span className="text-gray-600">Service image</span>
                        </p>
                        <CloudUpload
                          strokeWidth={2}
                          className="w-8 h-8 mb-2 text-[#A61866]"
                        />

                        <input
                          id="fileUploadService"
                          type="file"
                          accept="image/*"
                          onChange={handleServiceImage}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
                <div className="w-full  flex justify-end">
                  <button
                    onClick={() => navigate("/salon")}
                    className="w-20 h-8 px-2  font-semibold   outline-1 outline-offset-0 border border-[#A61866] rounded-full cursor-pointer bg-white  text-[#A61866]  hover:text-white hover:bg-[#A61866] transition-all ease-in duration-300 space-x-4"
                  >
                    save
                  </button>
                </div>
              </div>

              <div className="flex justify-start mr-4">
                <button className="w-30 h-9 px-2 flex justify-center  items-center text-[#A61866] bg-white hover:text-white hover:bg-[#A61866]  outline-1 outline-offset-0 border border-[#A61866] rounded-lg cursor-pointer  hover:bg-white hover:text-[#A61866] transition-all ease-in duration-300 space-x-3">
                  <h1 className="text-sm ">Add New</h1>
                  <span className="text-md flex-shrink-0 transform transition-transform duration-200 group-hover:scale-110">
                    <Plus className=" w-5 h-5 " />
                  </span>
                </button>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h1 className="font-semibold text-xl">Social Media</h1>
                  <p className="text-gray-500 text-sm">
                    Enter your salon's social media account
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <input
                    className="w-full h-[40px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-xl"
                    type="text"
                    placeholder="Tiktok Link"
                  />
                  <input
                    className="w-full h-[40px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-xl"
                    type="text"
                    placeholder="Twitter Link"
                  />
                  <input
                    className="w-full h-[40px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-xl"
                    type="text"
                    placeholder="Instagram Link"
                  />
                  <input
                    className="w-full h-[40px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-xl"
                    type="text"
                    placeholder="Linkedin Link"
                  />

                  <input
                    className="w-full h-[40px] pl-4  border border-gray-400 bg-gray-100 outline-none  rounded-xl"
                    type="text"
                    placeholder="Facebook Link"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom the Salon information */}
          <div className="flex flex-wrap w-full border-t border-gray-100  p-8  rounded-md shadow-lg space-x-2">
            <div className="w-full">
              <div className="flex justify-between ">
                <h1 className="text-2xl font-semibold"> Upload Documents </h1>
                <button className="w-62 h-12 px-2  py-3 flex cursor-pointer hover:scale-95  transition-all duration-300 mb-2 space-x-2">
                  <span className="flex-shrink-0 flex items-center transform transition-transform duration-200 group-hover:scale-110">
                    <Plus className=" w-4 h-4 text-[#A61866]" />
                  </span>
                  <h1 className="text-md text-[#A61866] font-semibold ">
                    Upload New Documents
                  </h1>
                </button>
              </div>
            </div>

            {/*Cards */}

            <div className="w-full">
              <div className="w-full gap-6 space-x-4 px-18 flex flex-wrap">
                {Array(4)
                  .fill(null)
                  .map((_, idx) => (
                    <>
                      <BusinessCards />
                    </>
                  ))}
              </div>
            </div>
          </div>
          <div className="w-full  flex justify-end">
            <button
              onClick={() => {
                navigate("/salon");
                handleSubmit();
              }}
              className="w-52 h-12 px-2 py-3 font-semibold   outline-1 outline-offset-0 border border-[#A61866] rounded-full cursor-pointer hover:bg-white  hover:text-[#A61866]  text-white bg-[#A61866] transition-all ease-in duration-300 space-x-4"
            >
              complete Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSalon;
