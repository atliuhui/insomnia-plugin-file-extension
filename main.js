// For help writing plugins, visit the documentation to get started:
//   https://docs.insomnia.rest/insomnia/introduction-to-plugins

const insomnia_plugin_file = require('insomnia-plugin-file').templateTags[0];
const _ = require('lodash');
const fs = require('fs');

module.exports.templateTags = [
    {
        name: 'fileExt',
        displayName: 'File Ext',
        description: insomnia_plugin_file.description,
        args: insomnia_plugin_file.args.concat([
            {
                displayName: 'Expression',
                type: 'string',
                description: 'standard for expressions "func:arg1,arg2..." => "func(input,arg1,arg2...)"'
            }
        ]),
        async run(context, path, expression) {
            if (!path) {
                throw new Error('No file selected');
            }
            console.debug(path, expression);

            let config = parse(expression);
            console.debug(config);

            switch (_.lowerCase(config.func)) {
                case "content":
                    return await insomnia_plugin_file.run(context, path);
                case "size":
                    let stat = await fs.statSync(path);
                    console.debug(path, stat);

                    return stat.size;
                default:
                    return path;
            }
        },
    },
];

function parse(filter) {
    let config = {
        func: null,
        args: []
    };

    if (!filter) {
        return config;
    }

    let func = _.first(_.split(filter, ':'));
    let args = _.trim(_.trimStart(_.replace(filter, func, ''), ':'));

    config.func = _.trim(func);
    if (args.length > 0) {
        config.args = _.map(_.split(args, ','), (item) => _.trim(item));
    }

    return config;
}
