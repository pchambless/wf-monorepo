require('module-alias/register');
const codeName = `[initialize.js] `;

module.exports = {
  initialize: async (req, res) => {
    try {
      console.log(codeName, 'Starting initialization...');
      // Any other initialization logic can go here
      res.status(200).send(codeName, 'Initialization successful');
    } catch (error) {
      console.error(codeName, 'Error during initialization:', error);
      res.status(500).send(codeName, 'Initialization failed'); 
    }
  }
};
