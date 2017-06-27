
const levels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3, // We don't need to follow the official npm spec for our loggin
};

exports = Object.assign(exports, levels);

exports.getString = function getString(level) {
    const keys = Object.keys(levels);
    for (let i = 0; i < keys.length; i++) {
        if (levels[keys[i]] === level) {
            return keys[i];
        }
    }
    return null;
};
