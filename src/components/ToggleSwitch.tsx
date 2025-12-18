type ToggleSwitchProps = {
  isOn: boolean;
  onToggle: () => void;
  labelOff: string;
  labelOn: string;
};

export function ToggleSwitch({
  isOn,
  onToggle,
  labelOff,
  labelOn,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-center mt-6">
      <div className="bg-base-300/50 p-1 rounded-full border border-base-content/10 relative inline-flex">
        {/* Sliding background */}
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full transition-all duration-300 ease-spring shadow-md ${
            isOn ? "left-[50%]" : "left-1"
          }`}
        ></div>

        <button
          onClick={() => isOn && onToggle()}
          className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
            !isOn
              ? "text-primary-content"
              : "text-base-content/60 hover:text-base-content"
          }`}
        >
          {labelOff}
        </button>
        <button
          onClick={() => !isOn && onToggle()}
          className={`relative z-10 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
            isOn
              ? "text-primary-content"
              : "text-base-content/60 hover:text-base-content"
          }`}
        >
          {labelOn}
        </button>
      </div>
    </div>
  );
}
