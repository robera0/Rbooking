import {
  Cards,
  SearchInput,
  SalonTable,
  BookingTable,
  TransactionTable,
} from "./Cards";
import {
  CalendarDays,
  Receipt,
  Funnel,
  CloudUpload,
  ChevronsRight,
  ChevronsLeft,
} from "lucide-react";

const Payment = () => {
  return (
    <div>
      <div className="w-[98%] space-y-16">
        <div>
          <h1 className="text-3xl font-semibold">Payments and Commission</h1>
        </div>
        <div className="mt-10 flex justify-around flex-wrap gap-10">
          {/*Total Earning */}
          <Cards
            header="Total Earning"
            num="150,000 ETB"
            topicons={
              <Receipt strokeWidth={2} className=" w-9 h-9  text-[#A61866]" />
            }
            daily_diff="Past 30 Days"
          />

          {/*Total Commission */}
          <Cards
            header="Total Commission "
            num="150,000 ETB"
            topicons={
              <Receipt strokeWidth={2} className=" w-9 h-9  text-[#A61866]" />
            }
            daily_diff="Past 30 Days"
          />
          {/*Average Commission  */}
          <Cards
            header="Average Commission  "
            num="5,000 ETB"
            topicons={
              <Receipt strokeWidth={2} className=" w-9 h-9  text-[#A61866]" />
            }
            daily_diff="Past 30 Days"
          />
        </div>

        {/*Table of Transaction */}
        <div className="w-full flex flex-wrap  gap-8">
          <div className="w-130 flex items-center  pl-8">
            <h1 className="text-2xl font-bold">Transaction History</h1>
          </div>

          {/*filter */}
          <button className=" w-42 h-12 flex justify-center items-center  bg-[#F5F6FA] rounded-full gap-2 ">
            <Funnel className="text-gray-500" />
            <select
              className="text-gray-500 w-24 rounded-xl  outline-none"
              name=""
              id=""
            >
              <option value="">Filter By</option>
            </select>
          </button>

          {/*date */}
          <div className="w-92 h-12 px-3 flex items-center bg-[#F5F6FA] rounded-full gap-3">
            {/* Start date */}
            <div className="w-40 h-8 px-2 bg-white rounded-lg flex items-center gap-2">
              <button type="button" className="text-gray-500 cursor-pointer">
                <CalendarDays size={18} />
              </button>
              <input
                type="date"
                className="no-calendar outline-none w-24 bg-transparent"
              />
            </div>

            <span className="text-gray-600">to</span>

            {/* End date */}
            <div className="w-40 h-8 px-2 bg-white rounded-lg flex items-center gap-2">
              <button type="button" className="text-gray-500 cursor-pointer">
                <CalendarDays size={18} />
              </button>
              <input
                type="date"
                className="no-calendar outline-none w-24 bg-transparent"
              />
            </div>
          </div>
          {/*Export */}
          <button className=" w-42 h-12 flex justify-center items-center  bg-[#F5F6FA] rounded-full gap-2 cursor-pointer ">
            <h1 className="text-gray-500">Export</h1>
            <CloudUpload className="text-gray-500 " />
          </button>
          <div className="overflow-hidden rounded-t-2xl ">
            <TransactionTable />
          </div>
          <div className="w-full mb-4 flex flex-wrap justify-between">
            <p className="text-gray-500 text-md font-semibold pl-4 ">
              showing 10 from 160 entries
            </p>
            <div className="  flex flex-wrap gap-6">
              <button className=" w-38 h-10 flex justify-center items-center  text-lg text-[#BD5990]  bg-[#E7D6DF] hover:bg-[#A61866]  cursor-pointer hover:text-white transition duration-300 rounded-xl gap-2 ">
                <ChevronsLeft strokeWidth={2} />
                Previous
              </button>

              <div className=" w-62 h-11 flex bg-white rounded-2xl">
                <div
                  className={`w-15 h-full flex justify-center items-center text-white font-bold bg-[#A61866] font-bold rounded-2xl`}
                >
                  <h1 className="text-center">1</h1>
                </div>
                <div
                  className={`w-15 h-full flex justify-center items-center text-[#A61866] font-bold  font-bold rounded-2xl`}
                >
                  <h1 className="text-center">2</h1>
                </div>
                <div
                  className={`w-15 h-full flex justify-center items-center text-[#A61866] font-bold  font-bold rounded-2xl`}
                >
                  <h1 className="text-center">3</h1>
                </div>
                <div
                  className={`w-15 h-full flex justify-center items-center text-[#A61866] font-bold font-bold rounded-2xl`}
                >
                  <h1 className="text-center">4</h1>
                </div>
              </div>
              <button className=" w-24 h-10  flex justify-center items-center  text-lg text-[#BD5990]  bg-[#E7D6DF] rounded-2xl hover:bg-[#A61866] cursor-pointer hover:text-white transition duration-300 gap-2 ">
                Next
                <ChevronsRight strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
