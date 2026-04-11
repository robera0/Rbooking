import {
  Search,
  Check,
  Star,
  ToggleRight,
  ToggleLeft,
  Trash2,
  BookText,
  Eye,
  Download,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useSalonContext } from "@/Context/salonContext";
import SalonDetail from "./SalonDetail";

export const Cards = ({
  header,
  num,
  bg,
  topicons,
  bottomIcon,
  percent_change,
  daily_diff,
  border,
}) => {
  const loading = !header || !num;
  if (loading) {
    return (
      <div className="pl-4 w-78 h-42 bg-white rounded-2xl shadow-lg shadow-pink-200 hover:scale-102 hover:shadow-xl hover:shadow-pink-300 transition duration-300">
        <Skeleton name="blog-card" loading={true} />
      </div>
    );
  }
  return (
    <div className="pl-4 w-78 h-42 bg-white rounded-2xl shadow-lg shadow-pink-200 hover:scale-102 hover:shadow-xl hover:shadow-pink-300 transition duration-300">
      <div className="flex pt-4">
        <div className="w-45 h-28 text-[#6F6F6F] font-semibold space-y-6 ">
          <h3>{header}</h3>
          <h1 className="text-2xl text-black font-bold">{num}</h1>
        </div>
        <div className="flex-1 pl-8  flex justify-center">
          <div
            className={`w-17 h-17 flex justify-center items-center ${bg} rounded-3xl `}
          >
            {topicons}
          </div>
        </div>
      </div>
      {/*Status */}
      <div className="flex gap-2">
        <div>{bottomIcon}</div>
        <p className="text-[#0DBAA0] font-semibold">{percent_change}</p>
        <p className="text-[#6F6F6F] font-semibold">{daily_diff}</p>
      </div>
    </div>
  );
};

// input

export const SearchInput = ({ placeholder, w, h, top, left }) => {
  return (
    <div className="relative">
      <button
        className={`absolute ${top} ${left} flex justify-center cursor-pointer`}
      >
        <Search className="text-sm w-5 h-5" />
      </button>
      <input
        className={`${w} ${h} px-12 bg-[#F5F6FA] rounded-full border border-gray-200 focus:none outline-none`}
        placeholder={placeholder}
        type="text"
      />
    </div>
  );
};

export const Table = ({ c1, c2, c3, c4, c5, c6, c7, c8, cbutton }) => {
  const [checkedItems, setCheckedItems] = useState(Array(10).fill(false));

  const handleHeaderCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setCheckedItems(Array(10).fill(isChecked));
  };

  const handleRowCheckboxChange = (index) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  const allChecked = checkedItems.every((item) => item);
  const someChecked = checkedItems.some((item) => item);

  return (
    <table className="w-full table-fixed text-md text-left">
      <thead className="bg-[#E3D0DA]">
        <tr>
          <th className="px-6 py-4 w-12 text-center">
            <label className="relative cursor-pointer" htmlFor="check-box-1">
              <input
                id="check-box-1"
                type="checkbox"
                className="w-5 h-5 appearance-none rounded-md border-2 border-black "
                checked={allChecked}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someChecked && !allChecked;
                  }
                }}
                onChange={handleHeaderCheckboxChange}
              />
              <Check
                strokeWidth={3}
                className={`absolute bottom-2 left-1 w-3 h-3 text-black transition-opacity ${
                  allChecked ? "opacity-100" : "opacity-0"
                }`}
              />
            </label>
          </th>
          <th className="px-6 py-4 w-[80px] text-center">ID</th>
          <th className="px-6 py-4 w-[120px] text-center">Name</th>
          <th className="px-6 py-4 w-[220px] text-center">Email</th>
          <th className="px-6 py-4 w-[150px] text-center">Date</th>
          <th className="px-6 py-4 w-[200px] text-center">Address</th>
          <th className="px-6 py-4 w-[140px] text-center">Verification</th>
          <th className="px-6 py-4 w-[120px] text-center">More</th>
        </tr>
      </thead>
      <tbody className="text-gray-800 font-medium">
        {Array(10)
          .fill(null)
          .map((_, idx) => (
            <tr key={idx} className="bg-white">
              <td className="relative px-6 py-4 text-center">
                <label className="relative cursor-pointer inline-block">
                  <input
                    type="checkbox"
                    className="w-5 h-5 appearance-none rounded-md border-2 border-black"
                    checked={checkedItems[idx]}
                    onChange={() => handleRowCheckboxChange(idx)}
                  />
                  <Check
                    strokeWidth={3}
                    className={`absolute bottom-3 left-1 w-3 h-3 text-black transition-opacity ${
                      checkedItems[idx] ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </label>
              </td>
              <td className="px-6 py-4 text-center">0002</td>
              <td className="px-6 py-4 text-center">ST-{idx + 1}23</td>
              <td className="px-6 py-4 text-center">
                christianbrooks@gmail.com
              </td>
              <td className="px-6 py-4 text-center">30 Jul 2025</td>
              <td className="px-6 py-4 text-center">2QF7+7H, Addis Ababa</td>
              <td className="px-6 py-4 text-center">Unverified</td>
              <td className="px-6 py-4 text-center">
                <button className="text-[#BC518C] font-semibold hover:underline">
                  View Detail
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export const SalonTable = () => {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState(Array(10).fill(false));
  const [activeToggles, setActiveToggles] = useState([]);
  const {
    current_page,
    isLoading,
    isError,
    error,
    getDetailSalon,
    salonDetail,
  } = useSalonContext();

  const handleToogle = (idx) => {
    if (activeToggles.includes(idx)) {
      setActiveToggles(activeToggles.filter((i) => i !== idx));
    } else {
      setActiveToggles([...activeToggles, idx]);
    }
  };

  const handleHeaderCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setCheckedItems(Array(10).fill(isChecked));
  };

  const handleRowCheckboxChange = (index) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  const allChecked = checkedItems.every((item) => item);
  const someChecked = checkedItems.some((item) => item);

  return (
    <table border="1" className="w-full table-fixed text-md text-left">
      <thead className="bg-[#E3D0DA]">
        <tr>
          <th className="px-6 py-4  w-12 text-center">
            <label className="relative cursor-pointer" htmlFor="check-box-1">
              <input
                id="check-box-1"
                type="checkbox"
                className="w-5 h-5 appearance-none rounded-md border-2 border-black "
                checked={allChecked}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someChecked && !allChecked;
                  }
                }}
                onChange={handleHeaderCheckboxChange}
              />
              <Check
                strokeWidth={3}
                className={`absolute bottom-2 left-1 w-3 h-3 text-black transition-opacity ${
                  allChecked ? "opacity-100" : "opacity-0"
                }`}
              />
            </label>
          </th>
          <th className="px-6 py-4 w-[180px] text-center">Name</th>
          <th className="px-6 py-4 w-[300px] text-center">Service</th>
          <th className="px-6 py-4 w-[140px] text-center">Rating</th>
          <th className="px-6 py-4 w-[150px] text-center">Status</th>
          <th className="px-6 py-4 w-[100px] text-center">Booking</th>
          <th className="px-6 py-4 w-[140px] text-center">Activation</th>
          <th className="px-6 py-4 w-[160px] text-center">More</th>
        </tr>
      </thead>
      <tbody className="text-gray-800 font-medium">
        {current_page?.map((salon, idx) => (
          <tr key={salon._id} className="bg-white">
            <td className="relative border-y border-gray-300 border-0 border-b-3 px-6 py-4 text-center">
              <label className="relative cursor-pointer inline-block">
                <input
                  type="checkbox"
                  className="w-5 h-5 appearance-none rounded-md border-2 border-black"
                  checked={checkedItems[idx]}
                  onChange={() => handleRowCheckboxChange(idx)}
                />
                <Check
                  strokeWidth={3}
                  className={`absolute bottom-3 left-1 w-3 h-3 text-black transition-opacity ${
                    checkedItems[idx] ? "opacity-100" : "opacity-0"
                  }`}
                />
              </label>
            </td>
            <td className="px-6 py-4 border-b-3 border-gray-300 text-center">
              <h1 className="text-md font-bold">{salon?.name}</h1>
              <p className="text-sm text-gray-500">{salon?.email}</p>
            </td>
            <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-3 text-center">
              <div className="flex flex-wrap gap-4 justify-center">
                {Array(6)
                  .fill(null)
                  .map((_, idx) => (
                    <div className="w-20 h-6 flex  flex-wrap justify-center items-center bg-[#E6E5E5] rounded-full">
                      <h1 className="font-bold text-sm">Hair</h1>
                    </div>
                  ))}
              </div>
            </td>
            <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-3 text-center">
              <div className="flex flex-wrap justify-center items-center space-x-1 ">
                <Star className="w-3 h-3 fill-[#FFE500] text-[#FFE500]" />
                <p>{salon?.rating}</p>
              </div>
            </td>
            <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-3 text-center">
              <div className="w-full h-8 flex flex-wrap justify-center items-center bg-[#FEE0C0] rounded-md">
                <h1 className="text-[#FC9933] font-bold text-sm">Pending</h1>
              </div>
            </td>
            <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-3 text-center">
              {salon?.totalBookings}
            </td>
            <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-3 text-center">
              <div className="flex justify-center items-center">
                <button
                  onClick={() => handleToogle(idx)}
                  className="flex flex-wrap justify-center items-center"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {activeToggles.includes(idx) ? (
                      <motion.div
                        key="on"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <ToggleRight className="w-10 h-10 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="off"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <ToggleLeft className="w-10 h-10 text-gray-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </td>
            <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-3 text-center">
              <button
                onClick={() => {
                  navigate("/salon/salonMang");
                  getDetailSalon(salon._id);
                  console.log(salonDetail);
                }}
                className="text-[#BC518C] font-semibold hover:underline"
              >
                View Detail
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const ServiceTable = () => {
  const [checkedItems, setCheckedItems] = useState(Array(10).fill(false));

  const handleHeaderCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setCheckedItems(Array(10).fill(isChecked));
  };

  const handleRowCheckboxChange = (index) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  const allChecked = checkedItems.every((item) => item);
  const someChecked = checkedItems.some((item) => item);

  return (
    <table border="1" className="w-full table-fixed text-md text-left">
      <thead className="bg-[#E3D0DA]">
        <tr>
          <th className="px-6 py-4 w-12 text-center">
            <label className="relative cursor-pointer" htmlFor="check-box-1">
              <input
                id="check-box-1"
                type="checkbox"
                className="w-5 h-5 appearance-none rounded-md border-2 border-black "
                checked={allChecked}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someChecked && !allChecked;
                  }
                }}
                onChange={handleHeaderCheckboxChange}
              />
              <Check
                strokeWidth={3}
                className={`absolute bottom-2 left-1 w-3 h-3 text-black transition-opacity ${
                  allChecked ? "opacity-100" : "opacity-0"
                }`}
              />
            </label>
          </th>
          <th className="px-6 py-4 w-[100px] text-center">SERVICE</th>
          <th className="px-6 py-4 w-[360px] text-center">DESCRIPTION</th>
          <th className="px-6 py-4 w-[140px] text-center">DURATION</th>
          <th className="px-6 py-4 w-[150px] text-center">PRICE</th>
          <th className="px-6 py-4 w-[100px] text-center">ACTION</th>
          <th className="px-6 py-4 w-[140px] text-center">DELETE</th>
        </tr>
      </thead>
      <tbody className="text-gray-800 font-medium">
        {Array(6)
          .fill(null)
          .map((_, idx) => (
            <tr key={idx} className="bg-white">
              <td className="relative border-y border-gray-300 border-0 border-b-2 px-6 py-4 text-center">
                <label className="relative cursor-pointer inline-block">
                  <input
                    type="checkbox"
                    className="w-5 h-5 appearance-none rounded-md border-2 border-black"
                    checked={checkedItems[idx]}
                    onChange={() => handleRowCheckboxChange(idx)}
                  />
                  <Check
                    strokeWidth={3}
                    className={`absolute bottom-3 left-1 w-3 h-3 text-black transition-opacity ${
                      checkedItems[idx] ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </label>
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-bold">
                {" "}
                Hair
              </td>
              <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-2 text-center text-sm  font-semibold">
                includes consultaion,wash,precision cut, blow-dry style.
              </td>
              <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-2 text-center ">
                60 mins
              </td>
              <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-2 text-center">
                300 ETB
              </td>
              <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-2 text-center">
                Edit
              </td>
              <td className="px-6 py-4 border-y border-gray-300 border-0 border-b-2 text-center">
                <div className="flex justify-center items-center">
                  <button
                    onClick={() => handleToogle(idx)}
                    className="flex flex-wrap justify-center items-center cursor-pointer"
                  >
                    <Trash2 className="w-6 h-6 text-red-400" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export const BookingTable = () => {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState(Array(10).fill(false));

  const handleHeaderCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setCheckedItems(Array(10).fill(isChecked));
  };

  const handleRowCheckboxChange = (index) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  const allChecked = checkedItems.every((item) => item);
  const someChecked = checkedItems.some((item) => item);

  return (
    <table className="w-full table-fixed border-collapse text-sm text-left">
      <thead className="bg-[#E3D0DA]">
        <tr>
          <th className="px-3 py-2 w-12 text-center ">
            <label className="relative cursor-pointer" htmlFor="check-box-1">
              <input
                id="check-box-1"
                type="checkbox"
                className="w-4 h-4 appearance-none rounded-md border-2 border-black"
                checked={allChecked}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someChecked && !allChecked;
                  }
                }}
                onChange={handleHeaderCheckboxChange}
              />
              <Check
                strokeWidth={3}
                className={`absolute bottom-1 left-1 w-3 h-3 text-black transition-opacity ${
                  allChecked ? "opacity-100" : "opacity-0"
                }`}
              />
            </label>
          </th>
          <th className="px-3 py-2 w-[100px] text-center">ID</th>
          <th className="px-3 py-2 w-[160px] text-center">CUSTOMER NAME</th>
          <th className="px-3 py-2 w-[160px] text-center">SALON</th>
          <th className="px-3 py-2 w-[130px] text-center">DATE</th>
          <th className="px-3 py-2 w-[120px] text-center">PRICE</th>
          <th className="px-3 py-2 w-[120px] text-center">STATUS</th>
          <th className="px-3 py-2 w-[200px] text-center">ADDRESS</th>
          <th className="px-3 py-2 w-[120px] text-center">PAYMENT</th>
          <th className="px-3 py-2 w-[120px] text-center">ACTION</th>
        </tr>
      </thead>
      <tbody className="text-gray-800 font-medium text-sm leading-tight">
        {Array(7)
          .fill(null)
          .map((_, idx) => (
            <tr key={idx} className="bg-white">
              <td className="relative px-3 py-2 text-center border-b-2 border-gray-300">
                <label className="relative cursor-pointer inline-block">
                  <input
                    type="checkbox"
                    className="w-4 h-4 appearance-none rounded-md border-2 border-black"
                    checked={checkedItems[idx]}
                    onChange={() => handleRowCheckboxChange(idx)}
                  />
                  <Check
                    strokeWidth={3}
                    className={`absolute bottom-1 left-1 w-3 h-3 text-black transition-opacity ${
                      checkedItems[idx] ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </label>
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                BK 0001
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                Christian Brooks
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                Dagi Spa & Salon{" "}
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                30 Jul 2025
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                300 ETB
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold text-green-600">
                Approved
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                2QF7+7H, Addis Ababa
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                Paid
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                <button
                  onClick={() => navigate("/booking/bookingdetail")}
                  className="text-[#BC518C] font-semibold hover:underline"
                >
                  View Detail
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export const MarketingTable = () => {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState(Array(10).fill(false));

  const handleHeaderCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setCheckedItems(Array(10).fill(isChecked));
  };

  const handleRowCheckboxChange = (index) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  const allChecked = checkedItems.every((item) => item);
  const someChecked = checkedItems.some((item) => item);

  return (
    <table className="w-full table-fixed border-collapse text-sm text-left">
      <thead className="bg-[#E3D0DA]">
        <tr>
          <th className="px-3 py-2 w-12 text-center ">
            <label className="relative cursor-pointer" htmlFor="check-box-1">
              <input
                id="check-box-1"
                type="checkbox"
                className="w-4 h-4 appearance-none rounded-md border-2 border-black"
                checked={allChecked}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someChecked && !allChecked;
                  }
                }}
                onChange={handleHeaderCheckboxChange}
              />
              <Check
                strokeWidth={3}
                className={`absolute bottom-1 left-1 w-3 h-3 text-black transition-opacity ${
                  allChecked ? "opacity-100" : "opacity-0"
                }`}
              />
            </label>
          </th>
          <th className="px-3 py-2 w-[100px] text-center">ID</th>
          <th className="px-3 py-2 w-[160px] text-center">CUSTOMER NAME</th>
          <th className="px-3 py-2 w-[160px] text-center">SALON</th>
          <th className="px-3 py-2 w-[130px] text-center">DATE</th>
          <th className="px-3 py-2 w-[120px] text-center">PRICE</th>
          <th className="px-3 py-2 w-[120px] text-center">STATUS</th>
          <th className="px-3 py-2 w-[200px] text-center">ADDRESS</th>
          <th className="px-3 py-2 w-[120px] text-center">PAYMENT</th>
          <th className="px-3 py-2 w-[120px] text-center">ACTION</th>
        </tr>
      </thead>
      <tbody className="text-gray-800 font-medium text-sm leading-tight">
        {Array(7)
          .fill(null)
          .map((_, idx) => (
            <tr key={idx} className="bg-white">
              <td className="relative px-3 py-2 text-center border-b-2 border-gray-300">
                <label className="relative cursor-pointer inline-block">
                  <input
                    type="checkbox"
                    className="w-4 h-4 appearance-none rounded-md border-2 border-black"
                    checked={checkedItems[idx]}
                    onChange={() => handleRowCheckboxChange(idx)}
                  />
                  <Check
                    strokeWidth={3}
                    className={`absolute bottom-1 left-1 w-3 h-3 text-black transition-opacity ${
                      checkedItems[idx] ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </label>
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                BK 0001
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                Christian Brooks
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                Dagi Spa & Salon{" "}
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                30 Jul 2025
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                300 ETB
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold text-green-600">
                Approved
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                2QF7+7H, Addis Ababa
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                Paid
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                <button
                  onClick={() => navigate("/booking/bookingdetail")}
                  className="text-[#BC518C] font-semibold hover:underline"
                >
                  View Detail
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export const TransactionTable = () => {
  const navigate = useNavigate();
  const [checkedItems, setCheckedItems] = useState(Array(10).fill(false));

  const handleHeaderCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setCheckedItems(Array(10).fill(isChecked));
  };

  const handleRowCheckboxChange = (index) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  const allChecked = checkedItems.every((item) => item);
  const someChecked = checkedItems.some((item) => item);

  return (
    <table className="w-full table-fixed border-collapse text-sm text-left">
      <thead className="bg-[#E3D0DA]">
        <tr>
          <th className="px-3 py-2 w-12 text-center ">
            <label className="relative cursor-pointer" htmlFor="check-box-1">
              <input
                id="check-box-1"
                type="checkbox"
                className="w-5 h-5 appearance-none rounded-md border-2 border-black"
                checked={allChecked}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someChecked && !allChecked;
                  }
                }}
                onChange={handleHeaderCheckboxChange}
              />
              <Check
                strokeWidth={3}
                className={`absolute  bottom-2 left-1 w-3 h-3 text-black transition-opacity ${
                  allChecked ? "opacity-100" : "opacity-0"
                }`}
              />
            </label>
          </th>
          <th className="px-3 py-2 w-[100px] text-center">ID</th>
          <th className="px-3 py-2 w-[160px] text-center">CUSTOMER NAME</th>
          <th className="px-3 py-2 w-[160px] text-center">SALON</th>
          <th className="px-3 py-2 w-[130px] text-center">DATE</th>
          <th className="px-3 py-2 w-[120px] text-center">PRICE</th>
          <th className="px-3 py-2 w-[120px] text-center">STATUS</th>
          <th className="px-3 py-2 w-[200px] text-center">COMMISSION</th>
          <th className="px-3 py-2 w-[160px] text-center">PAYMENT METHOD</th>
          <th className="px-3 py-2 w-[120px] text-center">ACTION</th>
        </tr>
      </thead>
      <tbody className="text-gray-800 font-medium text-sm leading-tight">
        {Array(7)
          .fill(null)
          .map((_, idx) => (
            <tr key={idx} className="bg-white">
              <td className="relative px-3 py-2 text-center border-b-2 border-gray-300">
                <label className="relative cursor-pointer inline-block">
                  <input
                    type="checkbox"
                    className="w-5 h-5 appearance-none rounded-md border-2 border-black"
                    checked={checkedItems[idx]}
                    onChange={() => handleRowCheckboxChange(idx)}
                  />
                  <Check
                    strokeWidth={3}
                    className={`absolute bottom-2 left-1 w-3 h-3 text-black transition-opacity ${
                      checkedItems[idx] ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </label>
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                TS 0001
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                Christian Brooks
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                Dagi Spa & Salon{" "}
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                30 Jul 2025
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                300 ETB
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold text-green-600">
                Approved
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                30 ETB
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                Telebirr
              </td>
              <td className="px-6 py-4 border-b-2 border-gray-300 text-center font-semibold">
                <button
                  onClick={() => navigate("/booking/bookingdetail")}
                  className="text-[#BC518C] font-semibold hover:underline"
                >
                  View Detail
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export const BookedServiceTable = () => {
  return (
    <table className="w-full table-fixed text-md text-left border-collapse">
      <thead className="bg-[#E3D0DA]">
        <tr>
          <th className="px-6 py-4 w-1/3 ">Service</th>
          <th className="px-6 py-4 w-1/3 text-center">Duration</th>
          <th className="px-24 py-4 w-1/3 text-end">Price</th>
        </tr>
      </thead>
      <tbody className="text-gray-800 font-medium">
        {Array(3)
          .fill(null)
          .map((_, idx) => (
            <tr key={idx} className="bg-white border-b border-gray-300">
              <td className="px-6 py-4 ">Makeup</td>
              <td className="px-6 py-4 text-center">60 min</td>
              <td className="px-24 py-4 text-end">500 ETB</td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};

export const BusinessCards = () => {
  // Simulate loading or missing data for demo; replace with real logic as needed
  const loading = false; // Set to true or use props to control
  const license = "Business License";
  const uploadDate = "2025: 07 : 11";
  if (loading || !license || !uploadDate) {
    return (
      <div className="flex flex-col gap-6 items-center pt-4 w-[248px] h-[248px] border border-gray-300 outline outline-1 outline-gray-400 rounded-xl shadow-md">
        <Skeleton name="blog-card" loading={true} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6 items-center pt-4 w-[248px] h-[248px] border border-gray-300 outline outline-1 outline-gray-400 rounded-xl shadow-md">
      <div className="w-14 h-14 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center">
        <BookText />
      </div>

      <div className="space-y-6">
        <h1 className="text-lg font-semibold">{license}</h1>
        <p className="text-sm text-gray-400">Upload: {uploadDate}</p>
      </div>
      {/*Buttons */}
      <div className="flex gap-2 text-xs">
        <button className=" w-22 h-6 flex justify-around items-center cursor-pointer border-2 border-[#A61866] text-[#A61866] rounded-md">
          <span className="items-center">Preview</span>
          <Eye className="w-4 h-4 fill-[#A61866] text-white" />
        </button>

        <button className="w-22 h-6  flex justify-around items-center border-2 cursor-pointer  rounded-md">
          <span className="items-center">Download</span>
          <Download className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export const RatingBreakdown = () => {
  const ratings = [
    { stars: 5, percent: 70 },
    { stars: 4, percent: 20 },
    { stars: 3, percent: 5 },
    { stars: 2, percent: 3 },
    { stars: 1, percent: 2 },
  ];

  return (
    <div className="space-y-4 w-96">
      {ratings.map((r) => (
        <div key={r.stars} className="flex items-center gap-2">
          <span className="w-4 text-sm font-medium">{r.stars}</span>
          <div className="flex-1 h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-[#a61866] rounded"
              style={{ width: `${r.percent}%` }}
            ></div>
          </div>
          <span className="w-10 text-sm text-gray-400 font-medium">
            {r.percent}%
          </span>
        </div>
      ))}
    </div>
  );
};
export const TimeSlots = () => {
  const availableSlots = [2, 9, 16, 17, 22, 23, 29, 31, 38, 43, 44];
  const limitedSlots = [4, 6, 11, 12, 19, 25, 34, 40, 41, 48];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const time = ["8:00", "10:00", "12:00", "2:00", "4:00", "6:00", "8:00"];

  return (
    <div className="flex flex-wrap w-115 gap-1">
      {Array(49)
        .fill(null)
        .map((_, index) => (
          <div
            key={index}
            className={`flex flex-col gap-6 items-center pt-4 w-[60px] h-[60px]  rounded-md shadow-sm
     ${
       availableSlots.includes(index)
         ? "bg-[#A61866]"
         : limitedSlots.includes(index)
         ? "bg-[#E4BAD1]"
         : "bg-[#B3B3B3]"
     }
     `}
          ></div>
        ))}
    </div>
  );
};
