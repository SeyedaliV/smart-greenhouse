import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GoBackBtn = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <button
      onClick={handleGoBack}
      className="flex justify-center items-center size-12 bg-white dark:bg-zinc-800 text-zinc-600 dark:text-gray-400 border border-zinc-200 dark:border-zinc-700
      rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-300">
      <ArrowLeft size={28} />
    </button>
  );
};

export default GoBackBtn;