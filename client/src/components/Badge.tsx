import mainiconsvg from "../assets/mainicon.svg";

interface BadgeProps {
    text?: string;
}

const Badge = ({ text = "# InterVue" }: BadgeProps) => {
    return (
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] px-4 py-1.5 rounded-full">
            <img
                src={mainiconsvg}
                alt="InterVue Logo"
                className="w-4 h-4"
            />
            <span className="text-white text-xs font-semibold">
                {text}
            </span>
        </div>
    );
};

export default Badge;