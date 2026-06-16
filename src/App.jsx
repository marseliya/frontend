import ToastProvider from "./components/ToastAlert";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <ToastProvider>
      <div className="App">
        <AppRouter />
      </div>
    </ToastProvider>
  );
}

export default App;
