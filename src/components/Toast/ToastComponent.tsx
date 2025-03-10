import React from "react";
import { Bounce, ToastContainer } from "react-toastify";

const ToastComponent: React.FC = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={true}
      draggable={true}
      pauseOnHover={true}
      theme="light"
      transition={Bounce}
    />
  );
};

export default ToastComponent;
