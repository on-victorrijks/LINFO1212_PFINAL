export const connnectedUserIsCreator = function(req, res, next) {
    req.userShouldBeCreatorOfFetchedKot = true;
    next();
}