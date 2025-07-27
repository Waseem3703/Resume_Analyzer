import { FaPenAlt } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";

function ResumeCardItem({ title, features }) {
  return (
    <div className="group rounded-lg transition-all duration-300 ease-in-out hover:bg-gradient-to-r from-gray-200 via-gray-300 to-blue-600 mb-6">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-4 transition-transform duration-300 group-hover:translate-x-[5px] group-hover:translate-y-[5px]">
        <FaPenAlt className="text-green-500 text-4xl sm:text-6xl bg-green-100 rounded-full p-2 sm:p-3" />
        
        {title && (
          <h3 className="text-xl sm:text-2xl text-black font-semibold flex items-center gap-2">
            <IoIosCheckmarkCircleOutline className="text-green-600 text-lg sm:text-xl" />
            {title}
          </h3>
        )}
        
        <div className="space-y-2">
          {features.map((item, i) => (
            <div key={i} className="text-black flex items-start gap-2 text-sm sm:text-base">
              <IoIosCheckmarkCircleOutline className="text-green-600 text-lg sm:text-xl" />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ResumeCardItem;
