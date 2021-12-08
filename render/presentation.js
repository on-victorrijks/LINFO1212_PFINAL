export const renderPresentation = (req, res, next) => { 
    res.render('presentation.html', req.pageConfiguration) 
}