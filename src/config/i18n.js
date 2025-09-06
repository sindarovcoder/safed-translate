
// Import the i18n library for internationalization (i18n) support
const i18n = require('i18n');
// Import the list of supported locales from the utils file
const { localesLanguage } = require('../base/utils')
// Configure i18n for localization
i18n.configure({
    locales: localesLanguage, // Set the available locales (languages) for the application
    directory: __dirname + '/../locales', // Directory where the translation files are stored
    defaultLocale: 'uz', // Default locale to use if no specific locale is set (Uzbek)
    objectNotation: true, // Enable object notation for accessing translation keys (e.g., `i18n.__('key.subkey')`)
    register: global // Register the i18n functions globally, so they can be accessed throughout the application
});
// Export the configured i18n instance to be used in other parts of the application
module.exports = i18n;
