export const renderRegister = (req, res, next) => { 
    res.render('register.html', req.pageConfiguration)
}