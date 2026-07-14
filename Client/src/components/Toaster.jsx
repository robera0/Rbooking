import { Toaster } from "react-hot-toast";

const AppToaster = () => (
  <Toaster
    position="top-center"
    toastOptions={{
      duration: 3000,
      style: {
        background: "var(--color-surface, #1C1F22)",
        color: "var(--color-text-primary, #fff)",
        border: "1px solid var(--color-muted-border, rgba(255,255,255,0.06))",
        fontSize: "13px",
        fontWeight: 600,
        borderRadius: "14px",
        padding: "12px 18px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
      },
      success: {
        iconTheme: {
          primary: "var(--color-brand, #FF7A00)",
          secondary: "#000",
        },
      },
      error: {
        iconTheme: {
          primary: "var(--color-danger, #ef4444)",
          secondary: "#fff",
        },
      },
    }}
  />
);

export default AppToaster;
