var jm = jm || {};
if (typeof module !== 'undefined' && module.exports) {
    jm = require('../');
}

jm.ProcessorTest = jm.Processor.extend({
    _className : 'processorTest',

    update : function(e, delta) {
        console.info('processo update');
    }
});
