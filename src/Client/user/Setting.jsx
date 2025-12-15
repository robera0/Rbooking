import React from "react";
import { NotificationMenu } from "../../components/Reusable";
const Setting = () => {
  return (
    <div className="pl-3 mb-12 space-y-12">
      <div className=" w-[97%] h-[550px]  bg-[#191B1D] pl-4 pt-6 rounded-md space-y-4">
        <div>
          <h1 className="text-white text-2xl font-semibold">
            Notification Settings
          </h1>
        </div>
        <div className="w-full h-[0.3px] bg-gray-600 " />
        {/*NOTIFICATION SCHEDULE  */}

        <div>
          <label className="block text-sm text-gray-300 mb-2">
            Newsletter <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-6 text-gray-300">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="male"
                defaultChecked
                className="accent-orange-500"
              />
              Daily
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="female"
                className="accent-orange-500"
              />
              Once a week
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
                value="female"
                className="accent-orange-500"
              />
              Twice a week
            </label>
          </div>
        </div>
        {/*NOTIFICATION TYPE */}
        <div className="space-y-4 mt-8">
          <NotificationMenu
            info={
              "I would like to know about information and offers related to my upcoming event "
            }
          />
          <NotificationMenu info={"Notify me when  new event is published "} />
          <NotificationMenu
            info={"Send SMS confirmation for all online payment "}
          />
          <NotificationMenu info={"Show your profile publicly  "} />
        </div>

        <div className="flex justify-end mr-4  pt-4 space-x-4">
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-2 py-2 rounded-md font-medium"
          >
            Save Changes
          </button>

          <button
            type="submit"
            className="bg-gray-500 hover:bg-orange-600 text-white text-sm px-6 py-2 rounded-md font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
      {/*SECURITY SETTING */}
      <div className="w-[97%] max-w-3xl bg-[#191B1D] rounded-xl p-6 space-y-6">
        <div>
          <h1 className="text-white text-2xl font-semibold">
            Security Settings
          </h1>
        </div>
        <div className="w-full h-px bg-gray-700" />
        {/* TWO FACTOR SECTION*/}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg text-white font-semibold">
              Two-Factor Authentication
            </h3>

            <p className="max-w-md text-gray-400 text-sm leading-relaxed">
              Add a phone number to set up two-factor authentication and improve
              account security.
            </p>
          </div>

          <input
            type="text"
            placeholder="Enter phone number"
            required
            className="
        w-full max-w-md
        bg-[#2a2d33] text-white
        rounded-md px-4 py-3
        outline-none
        focus:ring-2 focus:ring-orange-500
        text-sm
      "
          />

          {/* SEND CODE BUTTON */}
          <button
            type="submit"
            className=" w-fit
        bg-orange-500 hover:bg-orange-600
        text-white text-sm font-semibold
        px-4 py-2 rounded-md
        transition
      "
          >
            Send Code
          </button>

          <div className="space-y-1 mt-4">
            <h3 className="text-lg text-white font-semibold">Active session</h3>

            <p className="max-w-md text-gray-400 text-sm leading-relaxed">
              Selecting "Sign out" will sign you out from all devices except
              this one. This can take up to 10 minutes.
            </p>

            {/* SIGN OUT BUTTON */}
            <button
              type="submit"
              className=" w-fit mt-2
        bg-[#D03437] 
        text-white text-sm font-semibold
        px-4 py-2 rounded-md
        transition
      "
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting;
