import { createBrowserRouter } from "react-router-dom";
import { Extractor } from "../pages/Extractor";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Extractor />,
  },
]);
