import { RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import "./App.css";
import root from "./router/root";
import store from "./store";

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={root} />
    </Provider>
  );
}

export default App;
