export const renderLogin = (req, res, next) => { 
    res.render('login.html', req.pageConfiguration)
}