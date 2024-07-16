export const Button = ({
  onClick,
  label,
}: {
  onClick: () => void;
  label: string;
}) => {
  return (
    <button
      onClick={onClick}
      className="bg-[#81b64c] text-white font-semibold py-3 px-8 lg:px-10lg:px-14 rounded-lg text-base md:text-lg lg:text-xl xl:text-2xl border-b-4 border-[#5d9948] hover:border-[#5d9948] hover:bg-[#a3d160] transition"
    >
      {label}
    </button>
  );
};
