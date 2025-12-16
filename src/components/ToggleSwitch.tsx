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
      <div className="join">
        <button
          onClick={() => !isOn || onToggle()}
          className={`join-item btn btn-sm ${
            !isOn ? "btn-primary" : "btn-ghost"
          }`}
        >
          {labelOff}
        </button>
        <button
          onClick={() => isOn || onToggle()}
          className={`join-item btn btn-sm ${
            isOn ? "btn-primary" : "btn-ghost"
          }`}
        >
          {labelOn}
        </button>
      </div>
    </div>
  );
}
