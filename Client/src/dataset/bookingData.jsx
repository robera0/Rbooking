// dataset/bookingData.js

// Helper to parse "Jan 2024" into a Date object
const parseMonthYear = (str) => {
  const [month, year] = str.split(" ");
  return new Date(`${month} 1, ${year}`);
};

// Booking dataset (approx values from your chart)
export const bookingData = [
  { date: "Jan 2024", rate: 22 },
  { date: "Feb 2024", rate: 50 },
  { date: "Mar 2024", rate: 45 },
  { date: "Apr 2024", rate: 85 }, // peak
  { date: "May 2024", rate: 48 },
  { date: "Jun 2024", rate: 55 },
  { date: "Jul 2024", rate: 25 }, // dip
  { date: "Aug 2024", rate: 45 },
  { date: "Sep 2024", rate: 70 },
  { date: "Oct 2024", rate: 55 },
  { date: "Nov 2024", rate: 50 },
  { date: "Dec 2024", rate: 58 },
].map((d) => ({ ...d, date: parseMonthYear(d.date) }));

// Formatter for x-axis (months on x-axis)
export const dateAxisFormatter = (value, context) =>
  new Date(value).toLocaleDateString(undefined, {
    month: context.location === "tooltip" ? "long" : "short",
    year: "numeric",
  });
