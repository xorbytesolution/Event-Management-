import { Toaster } from "react-hot-toast";

function Toast() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,

        style: {
          borderRadius: "10px",
          padding: "12px 16px",
          fontSize: "14px",
        },

        success: {
          duration: 4000,
        },

        error: {
          duration: 5000,
        },
      }}
    />
  );
}

export default Toast;
