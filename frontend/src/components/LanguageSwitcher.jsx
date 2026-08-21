import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <div className="flex gap-1 text-sm">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded ${i18n.language === 'en' ? 'bg-[#043658] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('am')}
        className={`px-2 py-1 rounded ${i18n.language === 'am' ? 'bg-[#043658] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
      >
        አማ
      </button>
    </div>
  );
}

export default LanguageSwitcher;