import { cn } from "../lib/utils";

const Header = ({ activeTab, onTabChange }: any) => {
  return (
    <header className={cn("bg-primary text-primary-foreground shadow-md")}>
      <div className="container mx-auto flex justify-center items-center p-6">
        <nav className="space-x-10 text-lg">
          <button
            className={cn(
              "hover:text-blue-500 hover:animate-pulse",
              activeTab === "Model" ? "text-blue-500" : ""
            )}
            onClick={() => onTabChange("Model")}
          >
            Model
          </button>
          <button
            className={cn(
              "hover:text-blue-100 hover:animate-pulse",
              activeTab === "Predict Diabetes" ? "text-blue-100" : ""
            )}
            onClick={() => onTabChange("Predict Diabetes")}
          >
            Predict Diabetes
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
