import { RouterProvider } from "react-router-dom";
import { QueryProvider } from "./app/providers";
import { router } from "./app/router";
import "./app/styles/globals.css";

function App() {
  return (
    <QueryProvider>
      <RouterProvider router={router} />
    </QueryProvider>
  );
}

export default App;
