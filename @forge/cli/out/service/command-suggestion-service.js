"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const didyoumean_1 = tslib_1.__importDefault(require("didyoumean"));
class CommandSuggestionService {
    getSuggestions(input, list) {
        const set = [...list, ...list.map((item) => item.split(':')[0])];
        let result = set.filter((search) => search.includes(input));
        const dym = (0, didyoumean_1.default)(input, set);
        if (dym) {
            result.push(dym);
            result = [...result, ...set.filter((search) => search.includes(dym))];
        }
        return list.filter((item) => result.includes(item));
    }
}
exports.default = CommandSuggestionService;
