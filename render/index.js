export const renderIndex = (req, res, next) => { 
    res.render('index.html', req.pageConfiguration)
};