import i18n from 'i18next'; // 引入i18n
import { initReactI18next } from 'react-i18next'; // 引入react-i18next
import Backend from 'i18next-http-backend'; // 引入i18next-http-backend
import LanguageDetector from 'i18next-browser-languagedetector'; // 引入i18next-browser-languagedetector

// 初始化i18n
i18n
  .use(Backend) // 使用i18next-http-backend
  .use(LanguageDetector) // 使用i18next-browser-languagedetector
  .use(initReactI18next) // 使用react-i18next
  .init({
    fallbackLng: 'en', // 默认语言为英语
    debug: true, // 启用调试模式
    interpolation: {
      escapeValue: false, // 不转义HTML
    },
  });

export default i18n;