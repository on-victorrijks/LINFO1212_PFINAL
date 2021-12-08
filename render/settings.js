export const renderSettings = (req, res, next) => { 
    res.render('settings.html', req.pageConfiguration)
}