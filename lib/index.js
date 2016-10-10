if (typeof module !== 'undefined' && module.exports) {
    require('./factory');
    require('./processor');
    require('./entity');
    require('./component');
    require('./entitymanager');
    module.exports = require('jm-core');
}
