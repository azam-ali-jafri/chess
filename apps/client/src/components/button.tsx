export const Button = ({
  onClick,
  label,
  disabled,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) => {
  return (
    <button
      disabled={disabled ? true : false}
      onClick={onClick}
      className={`py-3 px-8 lg:px-10 text-base md:text-lg lg:text-xl xl:text-2xl border-b-4 ${primaryButtonStyles}`}
    >
      {label}
    </button>
  );
};

export const primaryButtonStyles =
  "bg-[#81b64c] text-white font-semibold rounded-lg  border-[#5d9948] hover:border-[#5d9948] hover:bg-[#a3d160] transition";
