#!/usr/bin/env node
// @ts-check
const { Program } = require('3h-cli');
const { App, createStaticHandler, Utils } = require('herver');
const { join } = require('path');

const DEFAULT_PORT = 8080;

const program = new Program('herve', {
    title: require('./package.json').description,
});

program
    .action({
        name: '<root>',
        help: 'The path to serve',
    })
    .option({
        name: '-p',
        alias: '--port',
        value: '<num>',
        help: `The port to use (default: ${DEFAULT_PORT})`,
    })
    .option({
        name: '-l',
        alias: '--log',
        help: 'Apply built-in logger',
    })
    .option({
        name: '-d',
        alias: '--default-pages',
        value: '<files...>',
        help: 'Default page files',
    })
    .option({
        name: '-h',
        alias: '--help',
        help: 'Display this help info',
    })
    .parse(process.argv)
    .then(args => {

        if (args.options.has('-h')) {
            return program.help();
        }

        const app = new App();
        const router = createStaticHandler(
            join(process.cwd(), args.actions[0] || '.'),
            {
                defaultPages: (
                    args.options.has('-d')
                        ? args.getOption('-d')
                        : createStaticHandler.defaults.defaultPages
                )
            }
        );

        if (args.options.has('-l')) {
            app.use(Utils.requestLogger);
        }
        app.use(router);

        const port = +(args.getOption('-p')[0] || DEFAULT_PORT);
        app.listen(port, () => {
            console.log(`Server started at port ${port}`);
            console.log('(Hit Ctrl-C to stop)');
        });

    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
