module.exports = {
    async rewrites() {
        return [
            {
                source: '/page/:page',
                destination: '/page/[page]',
            },
            ];
        },
};
