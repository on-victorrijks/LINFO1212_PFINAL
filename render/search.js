export const renderSearch = (req, res, next) => {            
    const searchQuery = (req.query && req.query.text_search) ? req.query.text_search : "...";
    req.pageConfiguration.page.title += searchQuery;
    req.pageConfiguration.page.description.replace("$text_search", searchQuery);
    req.pageConfiguration.query = {
        text_search: searchQuery,
    };
    res.render('search_results.html', req.pageConfiguration);
}