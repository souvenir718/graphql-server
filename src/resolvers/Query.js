async function feed(parent, args, context) {
    // 1
    const where = args.filter
        ? {
              OR: [{ description_contains: args.filter }, { url_contains: args.filter }],
          }
        : {};

    const links = await context.prisma.links({
        where,
        skip: args.skip,
        first: args.first,
        orderBy: args.orderBy,
    });
    const count = await context.prisma // 수정
        // 2
        .linksConnection({
            // 수정
            where, // 수정
        }) // 수정
        .aggregate() // 수정
        .count(); // 수정
    // 3
    return {
        // 수정
        links, // 수정
        count, // 수정
    }; // 수정
}

module.exports = {
    feed,
};
