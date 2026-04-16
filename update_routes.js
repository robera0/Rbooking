const fs = require("fs");
const path = require("path");

const appPath = path.join(__dirname, "Client", "src", "App.jsx");
let content = fs.readFileSync(appPath, "utf-8");

// 1. Remove deleted imports
const deletedImports = [
  "AddSalon",
  "Book_Setting",
  "Booking",
  "BookingDetail",
  "CreateBooking",
  "Salon_Setting",
  "SalonDetail",
  "SalonMang",
  "Service"
];
deletedImports.forEach(imp => {
  content = content.replace(new RegExp(`import ${imp} from "\\.\\./admin/${imp}";\\n`, "g"), "");
});

// 2. Add new imports
const newImports = `
import EventMang from "../admin/EventMang";
import AddEvent from "../admin/AddEvent";
import TicketOrders from "../admin/TicketOrders";
`;
content = content.replace(`import Configuration_Setting from "../admin/Configuration_Setting";`, newImports + `import Configuration_Setting from "../admin/Configuration_Setting";`);

// 3. Replace Routes
const oldRoutes = `        <Route
          path="/user"
          element={
            <Home>
              <PageWrapper>
                <User />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/salon"
          element={
            <Home>
              <PageWrapper>
                <SalonMang />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/salon/salonMang"
          element={
            <Home>
              <PageWrapper>
                <SalonDetail />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/salon/addSalon"
          element={
            <Home>
              <PageWrapper>
                <AddSalon />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/booking"
          element={
            <Home>
              <PageWrapper>
                <Booking />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/booking/bookingdetail"
          element={
            <Home>
              <PageWrapper>
                <BookingDetail />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/booking/createbooking"
          element={
            <Home>
              <PageWrapper>
                <CreateBooking />
              </PageWrapper>
            </Home>
          }
        />`;

const newRoutes = `        <Route
          path="/admin/users"
          element={
            <Home>
              <PageWrapper>
                <User />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/admin/events"
          element={
            <Home>
              <PageWrapper>
                <EventMang />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/admin/events/add"
          element={
            <Home>
              <PageWrapper>
                <AddEvent />
              </PageWrapper>
            </Home>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <Home>
              <PageWrapper>
                <TicketOrders />
              </PageWrapper>
            </Home>
          }
        />`;

content = content.replace(oldRoutes, newRoutes);

fs.writeFileSync(appPath, content, "utf-8");
console.log("App.jsx updated");

// Update SideBar.jsx
const sidebarPath = path.join(__dirname, "Client", "admin", "SideBar.jsx");
let sidebar = fs.readFileSync(sidebarPath, "utf-8");
sidebar = sidebar.replace('path="/user"', 'path="/admin/events"');
sidebar = sidebar.replace('path="/salon"', 'path="/admin/orders"');
sidebar = sidebar.replace('path="/payment"', 'path="/admin/users"');
// Change ShoppingBag and UsersRound icons if desired
sidebar = sidebar.replace('ShoppingBag', 'Ticket');
sidebar = sidebar.replace('Tickets', 'Ticket'); // keep import
fs.writeFileSync(sidebarPath, sidebar, "utf-8");
console.log("SideBar.jsx updated");
