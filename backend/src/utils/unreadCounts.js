export const toUnreadCountsObject = (unreadCounts) => {
    if (!unreadCounts) {
        return {};
    }

    const entries = typeof unreadCounts.entries === "function"
        ? Array.from(unreadCounts.entries())
        : Object.entries(unreadCounts);

    return entries.reduce((counts, [userId, value]) => {
        counts[userId.toString()] = Number(value) || 0;
        return counts;
    }, {});
};
